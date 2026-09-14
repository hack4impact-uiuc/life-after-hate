export const distanceToString = (distance) =>
  `${distance.toFixed(2)} miles away`;

export const websiteHref = (value) => {
  const address = String(value ?? "").trim();
  if (!address) return null;

  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(address)
        ? address
        : `https://${address.replace(/^\/\//, "")}`,
    );
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
