import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { apiRequest } from "../../utils/apiHelpers";
import "./styles.scss";

export const shortlistRequest = async (endpoint = "", method = "GET", data) =>
  (
    await apiRequest({
      endpoint: `shortlists${endpoint}`,
      method,
      data,
      withLoader: false,
    })
  ).result;

export function CopyLink({ path, label = "Copy link" }) {
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState(false);
  const url = new URL(path, window.location.origin).href;
  return (
    <div className="copy-link">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setStatus("Link copied. LAH sign-in required.");
          } catch {
            setFallback(true);
            setStatus("Copy the link below. LAH sign-in required.");
          }
        }}
      >
        {label}
      </button>
      <span role="status">{status}</span>
      {fallback && (
        <input
          aria-label="Link to share"
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}

export default function ResourceSharing({ resource, actions }) {
  const auth = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(null);
  async function showLists() {
    setOpen(true);
    setBusy(true);
    setMessage("");
    try {
      const rows = await shortlistRequest();
      setLists(
        rows.filter((l) => l.owner_id === auth.id || auth.role === "ADMIN"),
      );
    } catch {
      setMessage("Could not load shortlists. Close and try again.");
    } finally {
      setBusy(false);
    }
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      let target = selected;
      if (!target) {
        const created = await shortlistRequest("", "POST", {
          name: name.trim(),
        });
        target = created.id;
        setLists((previous) => [created, ...previous]);
        setSelected(target);
        setName("");
      }
      await shortlistRequest(`/${target}/resources/${resource._id}`, "PUT");
      setSaved(target);
      setMessage("Resource saved to shortlist.");
    } catch {
      setMessage("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="resource-sharing" aria-label="Share and save resource">
      {actions}
      <CopyLink
        path={`/resources/${resource._id}`}
        label="Copy resource link"
      />
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : showLists())}
        aria-expanded={open}
      >
        Add to shortlist
      </button>
      {open && (
        <form onSubmit={save}>
          <label>
            Shortlist
            <select
              value={selected}
              disabled={busy}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Create a new shortlist</option>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          {!selected && (
            <label>
              List name
              <input
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicago housing options"
              />
            </label>
          )}
          <p>
            Visible to signed-in LAH staff and volunteers. Use a general name
            without client details.
          </p>
          <button disabled={busy || (!selected && !name.trim())}>
            {busy ? "Saving…" : "Save resource"}
          </button>
        </form>
      )}
      <p role="status">
        {message}
        {saved && (
          <>
            {" "}
            <Link to={`/shortlists/${saved}`}>Open shortlist</Link>
          </>
        )}
      </p>
    </section>
  );
}
