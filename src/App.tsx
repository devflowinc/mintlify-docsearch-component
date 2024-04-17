/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useRef, useState } from "react";
import "./App.css";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import {
  ChunkMetadata,
  SearchOverGroupsResults,
} from "@devflowinc/trieve-js-ts-client";

const trieveDatasetId = import.meta.env.VITE_TRIEVE_DATASET_ID;
const trieveApiKey = import.meta.env.VITE_TRIEVE_API_KEY;

const testSearchQueries = [
  "Insert a code block",
  "component for a mermaid diagram",
  "Adding analytics with posthog",
  "How can I add support?",
  "Color scheme change for the website",
];

const searchOverGroups = async (
  query: string,
  abortController: AbortController
): Promise<SearchOverGroupsResults> => {
  const response = await fetch(
    `https://api.trieve.ai/api/chunk_group/group_oriented_search`,
    {
      method: "POST",
      headers: {
        Authorization: `${trieveApiKey}`,
        "TR-Dataset": `${trieveDatasetId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        search_type: "hybrid",
        highlight_delimiters: [" "],
      }),
      signal: abortController.signal,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  return await response.json();
};

const searchChunks = async (
  query: string,
  abortController: AbortController
): Promise<ChunkMetadata[]> => {
  const response = await fetch(`https://api.trieve.ai/api/chunk/search`, {
    method: "POST",
    headers: {
      Authorization: `${trieveApiKey}`,
      "TR-Dataset": `${trieveDatasetId}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      search_type: "hybrid",
      highlight_delimiters: [" "],
    }),
    signal: abortController.signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  const searchRespData = await response.json();

  return searchRespData.score_chunks.map(
    (score_chunk: any) => score_chunk.metadata[0]
  );
};

const classNames = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const SearchWithGroups = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchMode, setSearchMode] = useState<"group" | "chunk">("group");
  const [query, setQuery] = useState("");
  const [searchGroupResults, setSearchGroupResults] =
    useState<SearchOverGroupsResults | null>(null);
  const [searchChunkResults, setSearchChunkResults] = useState<ChunkMetadata[]>(
    []
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    const searchMode = url.searchParams.get("searchMode");

    if (q) {
      setQuery(q);
      setSearchMode(searchMode === "chunk" ? "chunk" : "group");
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("searchMode", searchMode);
    url.searchParams.set("q", query);
    window.history.pushState({}, "", url.toString());
  }, [searchMode, query]);

  useEffect(() => {
    if (searchMode != "group" || query === "") {
      setSearchGroupResults(null);
      return;
    }

    const abortController = new AbortController();

    const timeout = setTimeout(() => {
      searchOverGroups(query, abortController)
        .then((results) => {
          setSearchGroupResults(results);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }, 10);

    return () => {
      abortController.abort();
      clearTimeout(timeout);
    };
  }, [query, searchMode]);

  useEffect(() => {
    if (searchMode != "chunk" || query === "") {
      setSearchChunkResults([]);
      return;
    }

    const abortController = new AbortController();

    const timeout = setTimeout(() => {
      searchChunks(query, abortController)
        .then((results) => {
          setSearchChunkResults(results);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }, 10);

    return () => {
      abortController.abort();
      clearTimeout(timeout);
    };
  }, [query, searchMode]);

  return (
    <Transition.Root show={true} as={Fragment} afterLeave={() => {}} appear>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
          <div className="flex items-center justify-start w-full gap-x-3">
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-green-300 hover:bg-green-50"
              onClick={() => {
                setQuery((prev) => {
                  while (true) {
                    const randomQuery =
                      testSearchQueries[
                        Math.floor(Math.random() * testSearchQueries.length)
                      ];
                    if (randomQuery !== prev) {
                      return randomQuery;
                    }
                  }
                });
              }}
            >
              Try A Preset Query
            </button>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="searchMode"
                  name="searchMode"
                  type="checkbox"
                  className="h-4 w-4 rounded border-green-300 text-[rgb(13,147,115)] focus:ring-[rgb(13,147,115)]"
                  checked={searchMode === "group"}
                  onChange={(e) =>
                    setSearchMode(e.target.checked ? "group" : "chunk")
                  }
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="offers" className="font-medium text-gray-900">
                  Group Search
                </label>
              </div>
            </div>
          </div>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto transform overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all mt-2">
              <Combobox
                onChange={(selected: ChunkMetadata) => {
                  window.open(selected.link ?? "", "_blank");
                }}
              >
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-t-0 border-x-0 border-b border-gray-300 focus:border-gray-600 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:ring-offset-0 sm:text-sm"
                    placeholder="Search..."
                    onChange={(event) => setQuery(event.target.value)}
                    value={query}
                    ref={inputRef}
                    onBlur={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </div>

                {query === "" && (
                  <div className="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14">
                    <img
                      src="https://cdn.trieve.ai/trieve-logo.png"
                      className="mx-auto h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                    <p className="mt-4 font-semibold text-gray-900">
                      Find or ask anything
                    </p>
                    <p className="mt-2 text-gray-500">
                      AI search powered by <b>Trieve</b>. Start typing to search
                      or ask and the AI will interpret your search intent to
                      provide results.
                    </p>
                  </div>
                )}

                {searchMode === "group" &&
                  (searchGroupResults?.group_chunks.length ?? 0) > 0 && (
                    <Combobox.Options
                      static
                      className="max-h-[80vh] scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto pb-2"
                    >
                      {searchGroupResults?.group_chunks.map((result) => (
                        <li key={result.group_name}>
                          <h2 className="bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-900">
                            {result.group_name}
                          </h2>
                          <ul className="mt-2 text-sm text-gray-800">
                            {result.metadata.map((chunkWithCollisions) => (
                              <Combobox.Option
                                key={chunkWithCollisions.metadata[0].id}
                                value={chunkWithCollisions.metadata[0]}
                                className={({ active }) =>
                                  classNames(
                                    "px-4 py-2",
                                    active && "bg-[rgb(13,147,115)] text-white"
                                  )
                                }
                              >
                                <a
                                  href={
                                    chunkWithCollisions.metadata[0].link ?? ""
                                  }
                                  target="_blank"
                                >
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        chunkWithCollisions.metadata[0]
                                          .chunk_html ?? "",
                                    }}
                                  />
                                </a>
                              </Combobox.Option>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </Combobox.Options>
                  )}

                {searchMode === "chunk" &&
                  (searchChunkResults?.length ?? 0) > 0 && (
                    <Combobox.Options
                      static
                      className="max-h-[80vh] scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto pb-2"
                    >
                      {searchChunkResults.map((chunk) => (
                        <li key={chunk.id}>
                          <ul className="mt-2 text-sm text-gray-800">
                            <Combobox.Option
                              key={chunk.id}
                              value={chunk}
                              className={({ active }) =>
                                classNames(
                                  "px-4 py-2 border-b border-gray-300",
                                  active && "bg-[rgb(13,147,115)] text-white"
                                )
                              }
                            >
                              <a href={chunk.link ?? ""} target="_blank">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: chunk.chunk_html ?? "",
                                  }}
                                />
                              </a>
                            </Combobox.Option>
                          </ul>
                        </li>
                      ))}
                    </Combobox.Options>
                  )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const App = () => {
  return (
    <>
      <SearchWithGroups />
    </>
  );
};

export default App;
