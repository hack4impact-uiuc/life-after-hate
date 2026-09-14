import React, { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ResourceDetails from "../../components/ResourceDetails";
import { CopyLink, shortlistRequest } from "../../components/ResourceSharing";
import { replaceAllResources } from "../../redux/actions/resources";
import { apiRequest } from "../../utils/apiHelpers";
import { resourceName } from "../../redux/selectors/resource";
import "./styles.scss";

// An explicit allowlist: internal notes, descriptions and volunteer background
// never enter the handout, even when printing directly from the browser menu.
export function Handout({ resources }) {
  return (
    <div className="handout">
      <h1>Resource contacts</h1>
      <p>
        Prepared {new Date().toLocaleDateString()}. Contact each resource to
        confirm availability and next steps.
      </p>
      {resources.map((r) => (
        <article key={r._id}>
          <h2>{resourceName(r)}</h2>
          <dl>
            {[
              ["Contact", r.contactName],
              ["Phone", r.contactPhone],
              ["Email", r.contactEmail],
              ["Address", r.address],
              ["Website", r.websiteURL],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

export function ResourcePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const resource = useSelector((s) => s.resources.find((r) => r._id === id));
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setLoaded(false);
    setError(false);
    apiRequest({ endpoint: `resources/${id}`, withLoader: false })
      .then((r) => {
        if (active) {
          dispatch(replaceAllResources([r.result]));
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [id, dispatch]);
  return (
    <main className="shortlists-page resource-page">
      <Link to="/directory">← Resource directory</Link>
      {error || (loaded && !resource) ? (
        <p role="alert">
          This resource could not be loaded. It may have been removed.{" "}
          <button onClick={() => window.location.reload()}>Try again</button>
        </p>
      ) : !loaded ? (
        <p role="status">Loading resource…</p>
      ) : (
        <ResourceDetails
          resource={resource}
          onClose={() => window.location.assign("/directory")}
        />
      )}
    </main>
  );
}

export default function Shortlists() {
  const { id } = useParams();
  const history = useHistory();
  const auth = useSelector((s) => s.auth);
  const [storedData, setData] = useState(null);
  const [loadedFor, setLoadedFor] = useState(id);
  const data = loadedFor === id ? storedData : null;
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    setPreview(false);
    setConfirmDelete(false);
    setName("");
    document.title = "Shortlists - Life After Hate";
    shortlistRequest(id ? `/${id}` : "")
      .then((value) => {
        if (active) {
          setLoadedFor(id);
          setData(value);
          setName(id ? value.name : "");
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Could not load shortlists. The list may have been removed, or the connection interrupted.",
          );
      });
    return () => {
      active = false;
    };
  }, [id, revision]);
  const editable = data && (auth.role === "ADMIN" || data.owner_id === auth.id);
  async function mutate(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch {
      setError("Could not save your change. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={`shortlists-page ${id ? "has-handout" : ""}`}>
      <div className="shortlist-controls">
        {id && <Link to="/shortlists">← All shortlists</Link>}
        <header>
          <div>
            <h1>{id ? data?.name || "Shortlist" : "Shortlists"}</h1>
            <p>Shared within LAH. Only the creator and admins can edit.</p>
          </div>
          {id && data && (
            <CopyLink path={`/shortlists/${id}`} label="Copy shortlist link" />
          )}
        </header>
        {error && (
          <p role="alert">
            {error}{" "}
            <button onClick={() => setRevision((r) => r + 1)}>Reload</button>
          </p>
        )}
        {!data && !error && <p role="status">Loading shortlists…</p>}
        {data && !id && (
          <>
            <form
              className="shortlist-create"
              onSubmit={(e) => {
                e.preventDefault();
                mutate(async () => {
                  const list = await shortlistRequest("", "POST", {
                    name: name.trim(),
                  });
                  history.push(`/shortlists/${list.id}`);
                });
              }}
            >
              <label>
                New shortlist name
                <input
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicago housing options"
                />
              </label>
              <p>Use a general name without client details.</p>
              <button disabled={busy || !name.trim()}>Create shortlist</button>
            </form>
            {!data.length && (
              <p>
                No shortlists yet. Create one here or save a resource from its
                details.
              </p>
            )}
            <div className="shortlist-grid">
              {data.map((list) => (
                <Link
                  key={list.id}
                  to={`/shortlists/${list.id}`}
                  className="shortlist-card"
                >
                  <h2>{list.name}</h2>
                  <p>
                    {list.count} resource{list.count === 1 ? "" : "s"} ·{" "}
                    {list.owner_id === auth.id
                      ? "Created by you"
                      : "LAH shared list"}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
        {data && id && (
          <>
            <div className="shortlist-toolbar">
              <button
                disabled={!data.resources.length}
                onClick={() => setPreview((p) => !p)}
              >
                {preview ? "Close handout preview" : "Preview handout"}
              </button>
              {preview && (
                <button onClick={() => window.print()}>Print handout</button>
              )}
              <Link to="/directory">Browse resources</Link>
            </div>
            {preview ? (
              <p>
                The handout includes resource names and contact details.
                Internal notes, volunteer background and the shortlist name are
                excluded.
              </p>
            ) : (
              <>
                {editable && (
                  <details>
                    <summary>Manage shortlist</summary>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        mutate(async () => {
                          await shortlistRequest(`/${id}`, "PATCH", {
                            name: name.trim(),
                          });
                          setData((d) => ({ ...d, name: name.trim() }));
                        });
                      }}
                    >
                      <label>
                        List name
                        <input
                          required
                          maxLength={120}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </label>
                      <button disabled={busy || !name.trim()}>Save name</button>
                    </form>
                    <button
                      className="delete-list"
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete shortlist
                    </button>
                    {confirmDelete && (
                      <div role="alert">
                        <p>
                          Delete this shortlist for everyone? The resources will
                          remain in the directory.
                        </p>
                        <button
                          disabled={busy}
                          onClick={() =>
                            mutate(async () => {
                              await shortlistRequest(`/${id}`, "DELETE");
                              history.push("/shortlists");
                            })
                          }
                        >
                          Confirm delete
                        </button>{" "}
                        <button onClick={() => setConfirmDelete(false)}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </details>
                )}
                {!data.resources.length && (
                  <p>
                    This shortlist is empty. Open a resource in the directory or
                    map and choose “Add to shortlist.”
                  </p>
                )}
                <div className="shortlist-resources">
                  {data.resources.map((r) => (
                    <article key={r._id}>
                      <div>
                        <Link to={`/resources/${r._id}`}>
                          <h2>{resourceName(r)}</h2>
                        </Link>
                        <p>{r.address}</p>
                      </div>
                      {editable && (
                        <button
                          disabled={busy}
                          aria-label={`Remove ${resourceName(r)}`}
                          onClick={() =>
                            mutate(async () => {
                              await shortlistRequest(
                                `/${id}/resources/${r._id}`,
                                "DELETE",
                              );
                              setData((d) => ({
                                ...d,
                                resources: d.resources.filter(
                                  (item) => item._id !== r._id,
                                ),
                              }));
                            })
                          }
                        >
                          Remove
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {id && data && (
        <div className={preview ? "handout-preview" : "handout-print-only"}>
          <Handout resources={data.resources} />
        </div>
      )}
    </main>
  );
}
