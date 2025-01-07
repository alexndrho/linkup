import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../store";
import { Sex } from "../types/IUser";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useAtom(userAtom);

  return (
    <div className="max-w-[800px] mx-auto px-3">
      <div className="h-screen w-full flex flex-col py-14 justify-center">
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
            value={user.name}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, name: e.target.value }))
            }
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
                  setUser((prev) => ({
                    ...prev,
                    sex: Sex.MALE,
                  }));
                } else {
                  setUser((prev) => ({
                    ...prev,
                    sex: Sex.UNSPECIFIED,
                  }));
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
                  setUser((prev) => ({
                    ...prev,
                    sex: Sex.FEMALE,
                  }));
                } else {
                  setUser((prev) => ({
                    ...prev,
                    sex: Sex.UNSPECIFIED,
                  }));
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
                setUser((prev) => ({
                  ...prev,
                  age: e.target.value === "" ? null : parseInt(e.target.value),
                }))
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
            value={user.location}
            onChange={(e) =>
              setUser((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
          />
        </label>

        <button
          className="w-full mb-3 btn btn-primary"
          disabled={user.name === ""}
          onClick={() => navigate("/chat")}
        >
          Connect with a Stranger
        </button>

        <button
          className="w-full btn"
          disabled={user.name === ""}
          onClick={() => navigate("/public")}
        >
          Join Public Chat
        </button>
      </div>
    </div>
  );
};

export default Home;
