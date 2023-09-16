import { useEffect, useState } from "react";
import {
  addEventAPI,
  deleteEventAPI,
  editEventAPI,
  getEventsAPI,
} from "../utils/apis";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [event, setEvent] = useState("");
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [buttonText, setButtonText] = useState("Add Event");
  const [eventId, setEventId] = useState("");
  const navigate = useNavigate();
  const [sort, setSort] = useState(false);

  function getEvents(queryParam) {
    getEventsAPI(queryParam || "")
      .then((res) => {
        if (res.data.success) {
          setAllEvents(res.data.events);
        }
      })
      .catch((err) => {
        setErrors(err?.response?.data);
      });
  }

  function addEditEvent() {
    if (buttonText === "Edit Event") {
      editEventAPI({ id: eventId, name: event })
        .then((res) => {
          if (res.data.success) {
            setEvent("");
            setEventId("");
            setButtonText("Add Event");
            getEvents();
          }
        })
        .catch((err) => {
          setErrors(err?.response?.data);
        });
    } else {
      setLoading(true);
      setErrors(null);
      const payload = {
        name: event,
        createdAt: new Date(),
      };

      addEventAPI(payload)
        .then((res) => {
          if (res.data.success) {
            setEvent("");
            getEvents();
          }
        })
        .catch((err) => {
          setErrors(err?.response?.data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  function deleteEvent(id) {
    setErrors(null);

    deleteEventAPI(id)
      .then((res) => {
        if (res.data.success) {
          getEvents();
        }
      })
      .catch((err) => {
        setErrors(err?.response?.data);
      });
  }

  function editEvent(e) {
    setErrors(null);
    setEvent(e.name);
    setEventId(e._id);
    setButtonText("Edit Event");
  }

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      getEvents();
    } else {
      navigate("/login");
    }
  }, []);

  function logout() {
    sessionStorage.clear();
    navigate("/login");
  }

  function getSortedEvents() {
    setSort(!sort);
    getEvents(sort ? "" : "?sort=down");
  }

  return (
    <div className="mt-5">
      <div className="text-end pe-5">
        <button onClick={logout}>Logout</button>
      </div>
      <input
        type="text"
        placeholder="Enter a event"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
      />

      <button disabled={!event} onClick={addEditEvent}>
        {loading ? (
          <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>{buttonText}</>
        )}
      </button>

      <button className="ms-5" onClick={getSortedEvents}>
        {sort ? "Sort Up" : "Sort Down"}
      </button>

      {errors && (
        <div>
          {errors.errorCode} - {errors.errorMessage}
        </div>
      )}

      <div className="mt-4">
        {allEvents.map((e) => {
          return (
            <div className="p-2" key={e._id}>
              {e.name}{" "}
              <button onClick={() => editEvent(e)} disabled={e.createdByAdmin}>
                Edit
              </button>{" "}
              &nbsp;
              <button
                onClick={() => deleteEvent(e._id)}
                disabled={e.createdByAdmin}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
