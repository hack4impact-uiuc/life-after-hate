import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import logo from "../assets/images/lah-logo-2.png";
import "./style.css";
const paths = {
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 6" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  filter: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="9" cy="18" r="2" />
    </>
  ),
  list: (
    <>
      <path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V7l8-4 8 4v14M2 21h20M9 21v-5h6v5M8 9h1m6 0h1M8 12h1m6 0h1" />
    </>
  ),
  heart: <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8 6l8 8 8-8a5 5 0 0 0 0-7Z" />,
  work: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V3h8v4M3 12l9 4 9-4M12 13v5" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7v11H3zM9 21v-8h6v8" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  phone: (
    <path d="m4 3 4 0 2 5-3 2a15 15 0 0 0 7 7l2-3 5 2v4c-9 3-20-8-17-17Z" />
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  chevron: <path d="m8 4 8 8-8 8" />,
  box: (
    <>
      <path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 5 9-5M12 12v9" />
    </>
  ),
};
function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.building}
    </svg>
  );
}
const initial = [
  {
    id: 1,
    name: "Community Counseling Collective",
    city: "Chicago, IL",
    category: "Mental health",
    icon: "heart",
    description:
      "Compassionate, trauma-informed counseling for individuals and families finding their next chapter.",
    tags: ["Counseling", "Family support"],
    available: true,
    contact: "Morgan Ellis",
    hours: "Monday–Friday, 9 am–5 pm",
    details:
      "Individual and family counseling, peer support groups, and help navigating local care. An initial conversation helps determine the right support for each person.",
    notes:
      "Contact the intake coordinator before making a referral. Virtual appointments are available for people outside Chicago.",
  },
  {
    id: 2,
    name: "New Start Employment Center",
    city: "Chicago, IL",
    category: "Employment",
    icon: "work",
    description:
      "Practical support for a fresh start, from preparing a résumé to finding meaningful work.",
    tags: ["Job placement", "Skills training"],
    available: true,
    contact: "Jordan Hayes",
    hours: "Monday–Friday, 8 am–4 pm",
  },
  {
    id: 3,
    name: "Harbor Family Services",
    city: "Evanston, IL",
    category: "Family support",
    icon: "home",
    description:
      "A welcoming place for families to access practical support and build stronger connections.",
    tags: ["Family support", "Counseling"],
    available: false,
    contact: "Taylor Brooks",
    hours: "By appointment",
  },
  {
    id: 4,
    name: "Prairie Community Housing",
    city: "Oak Park, IL",
    category: "Housing",
    icon: "home",
    description:
      "Help finding stable housing, understanding options, and taking the next step toward independence.",
    tags: ["Housing", "Case management"],
    available: true,
    contact: "Casey Lane",
    hours: "Monday–Thursday, 10 am–6 pm",
  },
  {
    id: 5,
    name: "Westside Resource Network",
    city: "Chicago, IL",
    category: "Essential needs",
    icon: "box",
    description:
      "Everyday essentials and a network of neighbors ready to help with the things that matter.",
    tags: ["Food assistance", "Clothing"],
    available: true,
    contact: "Avery Quinn",
    hours: "Tuesday & Saturday, 10 am–2 pm",
  },
  {
    id: 6,
    name: "Bridgeway Peer Support",
    city: "Evanston, IL",
    category: "Community",
    icon: "people",
    description:
      "Shared experiences, new perspectives, and a supportive community to move forward with.",
    tags: ["Peer support", "Community"],
    available: false,
    contact: "Riley Parker",
    hours: "Wednesday evenings, 6–8 pm",
  },
];
function Dialog({ children, onClose, label, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const node = ref.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "detail-dialog" : "add-dialog"}
      aria-label={label}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-inner">{children}</div>
    </dialog>
  );
}
function App() {
  const [records, setRecords] = useState(initial),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All resources"),
    [city, setCity] = useState("All locations"),
    [available, setAvailable] = useState(false),
    [filters, setFilters] = useState(false),
    [view, setView] = useState("grid"),
    [saved, setSaved] = useState(new Set([1, 4])),
    [page, setPage] = useState("directory"),
    [selected, setSelected] = useState(null),
    [adding, setAdding] = useState(false),
    [menu, setMenu] = useState(false),
    [sort, setSort] = useState("Recommended"),
    [toast, setToast] = useState("");
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  const toggleSave = (id) =>
    setSaved((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  let visible = records.filter(
    (r) =>
      (page !== "saved" || saved.has(r.id)) &&
      (category === "All resources" || r.category === category) &&
      (city === "All locations" || r.city === city) &&
      (!available || r.available) &&
      `${r.name} ${r.description} ${r.tags.join(" ")} ${r.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === "Name A–Z")
    visible = [...visible].sort((a, b) => a.name.localeCompare(b.name));
  const categories = [
    "All resources",
    "Mental health",
    "Employment",
    "Housing",
    "Family support",
    "Essential needs",
    "Community",
  ];
  const navigate = (p) => {
    setPage(p);
    setMenu(false);
    setQuery("");
    setCategory("All resources");
    setCity("All locations");
    setAvailable(false);
  };
  return (
    <div className="draft-app">
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("directory");
          }}
        >
          <img src={logo} alt="Life After Hate" />
        </a>
        <div className="workspace-label">RESOURCE NETWORK</div>
        <nav aria-label="Main navigation">
          {[
            ["directory", "grid", "Directory"],
            ["saved", "bookmark", "Saved resources"],
            ["people", "people", "People"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={page === key ? "nav-item active" : "nav-item"}
              onClick={() => navigate(key)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {key === "saved" && <small>{saved.size}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-mark">↗</span>
          <strong>
            Connection makes
            <br />
            change possible.
          </strong>
          <p>
            A shared network.
            <br />A path forward.
          </p>
        </div>
        <div className="profile">
          <span className="avatar">AR</span>
          <div>
            <strong>Alex Rivera</strong>
            <span>Administrator · Demo</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMenu(true)}
          >
            <Icon name="menu" />
          </button>
          <span>Workspace</span>
          <Icon name="chevron" size={14} />
          <strong>
            {page === "saved"
              ? "Saved resources"
              : page === "people"
                ? "People"
                : "Directory"}
          </strong>
          <span className="draft-label">
            <i /> DESIGN PREVIEW
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div className="eyebrow">A NETWORK OF POSSIBILITY</div>
            <div className="heading-line">
              <div>
                <h1>
                  {page === "saved"
                    ? "Your saved resources"
                    : page === "people"
                      ? "Good people. Shared purpose."
                      : "Resource directory"}
                </h1>
                <p>
                  {page === "saved"
                    ? "Keep the right connections close at hand."
                    : page === "people"
                      ? "Manage access to your resource network."
                      : "Connect people with the support they need to move forward."}
                </p>
              </div>
              {page !== "people" && (
                <button
                  className="primary-button"
                  onClick={() => setAdding(true)}
                >
                  <Icon name="plus" size={18} />
                  Add resource
                </button>
              )}
            </div>
          </div>
          {page === "people" ? (
            <People />
          ) : (
            <>
              <section className="search-area" aria-label="Find resources">
                <div className="search-line">
                  <label className="search-box">
                    <Icon name="search" size={22} />
                    <input
                      aria-label="Search resources"
                      placeholder="Search resources, services, or keywords"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button
                        className="icon-button"
                        aria-label="Clear search"
                        onClick={() => setQuery("")}
                      >
                        <Icon name="close" size={16} />
                      </button>
                    )}
                  </label>
                  <button
                    className={
                      filters ? "filter-button chosen" : "filter-button"
                    }
                    aria-expanded={filters}
                    onClick={() => setFilters(!filters)}
                  >
                    <Icon name="filter" size={18} />
                    Filters
                    {(city !== "All locations" || available) && (
                      <span className="filter-dot" />
                    )}
                  </button>
                </div>
                {filters && (
                  <div className="filter-options">
                    <label>
                      Location
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        {[
                          "All locations",
                          "Chicago, IL",
                          "Evanston, IL",
                          "Oak Park, IL",
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={available}
                        onChange={(e) => setAvailable(e.target.checked)}
                      />
                      Accepting referrals only
                    </label>
                    <button
                      className="text-button"
                      onClick={() => {
                        setCity("All locations");
                        setAvailable(false);
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                )}
                <div className="categories" aria-label="Resource categories">
                  {categories.map((c) => (
                    <button
                      key={c}
                      aria-pressed={category === c}
                      className={
                        category === c ? "category active" : "category"
                      }
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>
              <div className="results-toolbar">
                <p>
                  <strong>{visible.length}</strong>{" "}
                  {visible.length === 1 ? "resource" : "resources"}
                  <span> in your network</span>
                </p>
                <div className="view-tools">
                  <label className="sort-label">
                    Sort by{" "}
                    <select
                      aria-label="Sort resources"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option>Recommended</option>
                      <option>Name A–Z</option>
                    </select>
                  </label>
                  <div className="view-switch">
                    {["grid", "list"].map((v) => (
                      <button
                        key={v}
                        className={v === view ? "active" : ""}
                        aria-label={`${v} view`}
                        aria-pressed={v === view}
                        onClick={() => setView(v)}
                      >
                        <Icon name={v} size={17} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className={`resource-grid ${view === "list" ? "list-layout" : ""}`}
              >
                {visible.map((r) => (
                  <article key={r.id} className="resource-card">
                    <div className="card-top">
                      <span className={`resource-icon ${r.icon}`}>
                        <Icon name={r.icon} size={23} />
                      </span>
                      <span className="resource-category">{r.category}</span>
                      <button
                        className={
                          saved.has(r.id) ? "icon-button saved" : "icon-button"
                        }
                        aria-label={`${saved.has(r.id) ? "Unsave" : "Save"} ${r.name}`}
                        aria-pressed={saved.has(r.id)}
                        onClick={() => toggleSave(r.id)}
                      >
                        <Icon
                          name="bookmark"
                          size={19}
                          fill={saved.has(r.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <button
                      className="card-title"
                      onClick={() => setSelected(r)}
                    >
                      <h2>{r.name}</h2>
                    </button>
                    <div className="location">
                      <Icon name="pin" size={14} />
                      {r.city}
                    </div>
                    <p className="card-description">{r.description}</p>
                    <div className="tags">
                      {r.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <div className="card-footer">
                      <span
                        className={
                          r.available ? "availability yes" : "availability"
                        }
                      >
                        <i />
                        {r.available
                          ? "Accepting referrals"
                          : "Contact for availability"}
                      </span>
                      <button
                        className="detail-link"
                        aria-label={`View ${r.name}`}
                        onClick={() => setSelected(r)}
                      >
                        <span>Details</span>
                        <Icon name="arrow" size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!visible.length && (
                <div className="empty-state">
                  <Icon name="search" size={32} />
                  <h2>A different search might help.</h2>
                  <p>Try another keyword or broaden your filters.</p>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setQuery("");
                      setCategory("All resources");
                      setCity("All locations");
                      setAvailable(false);
                    }}
                  >
                    Clear search & filters
                  </button>
                </div>
              )}
              <div className="page-end">
                <span>People first. Possibilities next.</span>
                <span>All records in this preview are fictional.</span>
              </div>
            </>
          )}
        </main>
      </div>
      {selected && (
        <Dialog label={selected.name} wide onClose={() => setSelected(null)}>
          <div className="detail-top">
            <span>RESOURCE PROFILE</span>
            <div>
              <button
                className={
                  saved.has(selected.id) ? "icon-button saved" : "icon-button"
                }
                aria-label="Save resource"
                aria-pressed={saved.has(selected.id)}
                onClick={() => toggleSave(selected.id)}
              >
                <Icon
                  name="bookmark"
                  fill={saved.has(selected.id) ? "currentColor" : "none"}
                />
              </button>
              <button
                className="icon-button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
              >
                <Icon name="close" />
              </button>
            </div>
          </div>
          <div className="detail-content">
            <span className="resource-icon large">
              <Icon name={selected.icon} size={30} />
            </span>
            <div className="detail-category">
              {selected.category} <span> / </span> Organization
            </div>
            <h2>{selected.name}</h2>
            <div className="location">
              <Icon name="pin" size={16} />
              {selected.city}
            </div>
            <div
              className={
                selected.available ? "status-banner available" : "status-banner"
              }
            >
              <Icon name={selected.available ? "check" : "phone"} size={17} />
              {selected.available
                ? "Accepting new referrals"
                : "Contact to confirm availability"}
            </div>
            <section>
              <h3>About this resource</h3>
              <p>{selected.details || selected.description}</p>
              <div className="tags">
                {selected.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </section>
            <section className="contact-section">
              <h3>Make a connection</h3>
              <div className="contact-person">
                <span className="avatar">
                  {selected.contact
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
                </span>
                <div>
                  <strong>{selected.contact}</strong>
                  <span>Intake coordinator</span>
                </div>
              </div>
              <div className="contact-row">
                <Icon name="mail" />
                <span>hello@example.com</span>
                <button
                  className="text-button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText("hello@example.com");
                      setToast("Demo email copied");
                    } catch {
                      setToast("Demo email: hello@example.com");
                    }
                  }}
                >
                  Copy
                </button>
              </div>
              <div className="contact-row">
                <Icon name="phone" />
                <span>(312) 555-0100</span>
              </div>
              <div className="detail-facts">
                <div>
                  <small>HOURS</small>
                  <p>{selected.hours}</p>
                </div>
                <div>
                  <small>SERVICE AREA</small>
                  <p>{selected.city} and surrounding communities</p>
                </div>
              </div>
            </section>
            <section>
              <h3>
                Referral notes <span className="internal-label">INTERNAL</span>
              </h3>
              <div className="notes">
                {selected.notes ||
                  "Reach out to the coordinator to confirm eligibility, current availability, and the best next steps before sharing a referral."}
              </div>
            </section>
            <div className="detail-disclaimer">
              Design preview · Fictional resource and contact information.
            </div>
          </div>
          <footer className="detail-bottom">
            <button
              className="secondary-button"
              onClick={() => setSelected(null)}
            >
              Back to directory
            </button>
            <button
              className="primary-button"
              onClick={() => {
                toggleSave(selected.id);
              }}
            >
              <Icon name="bookmark" size={17} />
              {saved.has(selected.id) ? "Saved to your list" : "Save resource"}
            </button>
          </footer>
        </Dialog>
      )}
      {adding && (
        <Dialog label="Add resource" onClose={() => setAdding(false)}>
          <div className="detail-top">
            <span>GROW THE NETWORK</span>
            <button
              className="icon-button"
              aria-label="Close form"
              onClick={() => setAdding(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          <form
            className="add-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setRecords([
                ...records,
                {
                  id: Date.now(),
                  name: f.get("name"),
                  city: f.get("city"),
                  category: f.get("category"),
                  description: f.get("description"),
                  icon: "building",
                  tags: [f.get("category")],
                  available: false,
                  contact: "Demo coordinator",
                  hours: "Contact for hours",
                },
              ]);
              setAdding(false);
              navigate("directory");
              setToast("Resource added to this preview only");
            }}
          >
            <h2>A new connection.</h2>
            <p>Add the essentials. More details can come later.</p>
            <label>
              Resource name <span>*</span>
              <input
                name="name"
                required
                maxLength={100}
                placeholder="Organization or resource name"
              />
            </label>
            <div className="form-pair">
              <label>
                Category
                <select name="category">
                  {categories.slice(1).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <select name="city">
                  {["Chicago, IL", "Evanston, IL", "Oak Park, IL"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              How can they help? <span>*</span>
              <textarea
                name="description"
                required
                maxLength={400}
                rows={4}
                placeholder="A short description of the support they provide"
              />
            </label>
            <div className="form-note">
              Draft mode: changes stay in this browser tab and reset on refresh.
            </div>
            <button className="primary-button" type="submit">
              <Icon name="plus" size={18} />
              Add resource
            </button>
          </form>
        </Dialog>
      )}
      {toast && (
        <div role="status" className="toast">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function People() {
  const [approved, setApproved] = useState(false);
  return (
    <div className="people-panel">
      <div className="people-heading">
        <h2>Network members</h2>
        <span>3 people</span>
      </div>
      {[
        ["Alex Rivera", "alex@example.com", "Administrator"],
        ["Jordan Hayes", "jordan@example.com", "Volunteer"],
        [
          "Casey Lane",
          "casey@example.com",
          approved ? "Volunteer" : "Pending approval",
        ],
      ].map(([name, email, role]) => (
        <div className="person" key={name}>
          <span className="avatar">
            {name
              .split(" ")
              .map((s) => s[0])
              .join("")}
          </span>
          <div>
            <strong>{name}</strong>
            <span>{email}</span>
          </div>
          <span className="person-role">{role}</span>
          {role === "Pending approval" && (
            <button
              className="secondary-button"
              onClick={() => setApproved(true)}
            >
              Approve in draft
            </button>
          )}
        </div>
      ))}
      <p className="form-note">
        Fictional accounts. Approval only changes this preview.
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
