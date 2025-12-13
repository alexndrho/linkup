"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAtom } from "jotai";

import { loadUser, storeUser, userAtom } from "@/lib/store";
import { Sex } from "@/types/user";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    setUser(loadUser());
  }, [setUser]);

  const setUserAndStore = (newUser: typeof user) => {
    setUser(newUser);
    storeUser(newUser);
  };

  return (
    <div className="max-w-200 h-dvh mx-auto px-3">
      <div className="h-full w-full flex flex-col py-14 justify-center">
        <h1 className="mb-8 text-6xl text-center font-bold">
          Link
          <span className="ml-1 p-1 bg-primary text-base-100 rounded-lg">
            Up
          </span>
        </h1>

        <p className="mb-5 text-lg text-center font-bold">
          Anonymous random chat with strangers
        </p>

        <label className="mb-3 form-control w-full">
          <div className="label">
            <span className="label-text">How would you like to be called?</span>
          </div>

          <input
            type="text"
            className="input input-bordered w-full"
            value={user.name || ""}
            onChange={(e) => setUserAndStore({ ...user, name: e.target.value })}
          />
        </label>

        <p className="my-4 text-sm text-center">
          Additional details are optional
        </p>

        <div className="mb-3 w-full flex justify-between">
          <div className="flex gap-2">
            <button
              className={`btn btn-square ${
                user.sex === Sex.MALE ? "btn-primary" : ""
              }`}
              onClick={() => {
                if (user.sex !== Sex.MALE) {
                  setUserAndStore({
                    ...user,
                    sex: Sex.MALE,
                  });
                } else {
                  setUserAndStore({
                    ...user,
                    sex: Sex.UNSPECIFIED,
                  });
                }
              }}
            >
              M
            </button>
            <button
              className={`btn btn-square ${
                user.sex === Sex.FEMALE ? "btn-primary" : ""
              }`}
              onClick={() => {
                if (user.sex !== Sex.FEMALE) {
                  setUserAndStore({
                    ...user,
                    sex: Sex.FEMALE,
                  });
                } else {
                  setUserAndStore({
                    ...user,
                    sex: Sex.UNSPECIFIED,
                  });
                }
              }}
            >
              F
            </button>
          </div>

          <label className="text-sm">
            Age
            <input
              type="number"
              className="ml-3 w-28 input input-bordered"
              min={0}
              value={user.age || ""}
              onChange={(e) =>
                setUserAndStore({
                  ...user,
                  age: e.target.value === "" ? null : parseInt(e.target.value),
                })
              }
            />
          </label>
        </div>

        <label className="mb-3 form-control w-full">
          <div className="label">
            <span className="label-text">Location</span>
          </div>

          <input
            type="text"
            className="input input-bordered w-full"
            value={user.location || ""}
            onChange={(e) =>
              setUserAndStore({
                ...user,
                location: e.target.value,
              })
            }
          />
        </label>

        <div className="flex justify-between gap-3">
          <button
            className="flex-1 mb-3 btn btn-primary"
            disabled={user.name.trim() === ""}
            onClick={() => router.push("/chat")}
          >
            Chat with a Stranger
          </button>

          <button
            className="flex-1 mb-3 btn btn-secondary"
            disabled={user.name.trim() === ""}
            onClick={() => router.push("/video")}
          >
            Video Chat with a Stranger
          </button>
        </div>

        <button
          className="w-full btn"
          disabled={user.name.trim() === ""}
          onClick={() => router.push("/public")}
        >
          Join Public Chat
        </button>
      </div>
    </div>
  );
}
