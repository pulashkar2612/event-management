import { useEffect, useState } from "react";
import { addEventAPI, getAllUsersAPI } from "../utils/apis";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [event, setEvent] = useState("");

  useEffect(() => {
    getAllUsersAPI()
      .then((res) => {
        if (res.data.success) {
          setUsers(res.data.users);
        }
      })
      .catch((err) => {});
  }, []);

  function createEvent(userId, emailIds) {
    addEventAPI({
      name: event,
      createdAt: new Date(),
      userId: userId,
      createdByAdmin: typeof userId === "object",
      emailIds,
    })
      .then((res) => {
        if (res.data.success) {
          setEvent("");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function createEventForAllUsers() {
    const userIds = users.map((e) => e._id);
    const emailIds = users.map((e) => e.email);
    createEvent(userIds, emailIds);
  }

  return (
    <div className="mt-5">
      <div>
        <label>Event - </label>
        <input
          type="text"
          onChange={(e) => setEvent(e.target.value)}
          value={event}
        />
      </div>
      <ul className="mb-5">
        {users.map((e) => {
          return (
            <li>
              {e.username} - {e.email}&nbsp;{" "}
              <button onClick={() => createEvent(e._id)}>Create Event</button>
            </li>
          );
        })}
      </ul>
      <div>
        <button onClick={createEventForAllUsers}>
          Create Event For All Users
        </button>
      </div>
    </div>
  );
}
