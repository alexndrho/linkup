import { useState } from "react";

enum Gender {
  MALE,
  FEMALE,
  UNSPECIFIED,
}

function App() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.UNSPECIFIED);
  const [age, setAge] = useState<number | null>(null);
  const [location, setLocation] = useState("");

  return (
    <div className="w-96 mx-auto px-3">
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <p className="my-4 text-sm text-center">
          Additional details are optional
        </p>

        <div className="mb-3 w-full flex justify-between">
          <div className="flex gap-2">
            <button
              className={`btn btn-square ${
                gender === Gender.MALE ? "btn-primary" : ""
              }`}
              onClick={() => {
                if (gender !== Gender.MALE) {
                  setGender(Gender.MALE);
                } else {
                  setGender(Gender.UNSPECIFIED);
                }
              }}
            >
              M
            </button>
            <button
              className={`btn btn-square ${
                gender === Gender.FEMALE ? "btn-primary" : ""
              }`}
              onClick={() => {
                if (gender !== Gender.FEMALE) {
                  setGender(Gender.FEMALE);
                } else {
                  setGender(Gender.UNSPECIFIED);
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
              value={age || ""}
              onChange={(e) => setAge(parseInt(e.target.value))}
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>

        <button className="w-full btn btn-primary" disabled={name === ""}>
          Connect
        </button>
      </div>
    </div>
  );
}

export default App;
