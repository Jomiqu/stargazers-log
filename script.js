const repositoryList = document.querySelector("#repository-list");
const repoCount = document.querySelector("#repo-count");
const loadMessage = document.querySelector("#load-message");

const numberFormat = new Intl.NumberFormat("es");
const dateFormat = new Intl.DateTimeFormat("es", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});

function isSafeHttpUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getFormattedDate(dateValue) {
  if (!dateValue) {
    return "Fecha no disponible";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return `Marcado ${dateFormat.format(parsedDate)}`;
}

function isValidRepositoryEvent(event) {
  if (!event || event.type !== "starred" || !event.repo) {
    return false;
  }

  const { repo } = event;
  const stars = Number(repo.stars);

  return (
    typeof repo.full_name === "string" &&
    repo.full_name.trim() !== "" &&
    typeof repo.description === "string" &&
    typeof repo.language === "string" &&
    typeof repo.url === "string" &&
    isSafeHttpUrl(repo.url) &&
    Number.isFinite(stars)
  );
}

function createRepositoryItem(event, index) {
  const { repo } = event;
  const item = document.createElement("li");
  item.className = "repository-item";
  item.style.animationDelay = `${index * 70}ms`;

  const link = document.createElement("a");
  link.className = "repository-link";
  link.href = repo.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = repo.full_name;

  const description = document.createElement("p");
  description.className = "repository-description";
  description.textContent = repo.description;

  const metadata = document.createElement("div");
  metadata.className = "repository-meta";

  const language = document.createElement("span");
  language.textContent = repo.language;

  const stars = document.createElement("span");
  stars.className = "star-count";
  stars.textContent = `★ ${numberFormat.format(Number(repo.stars))}`;

  const date = document.createElement("time");
  date.className = "repository-date";
  date.dateTime = event.starred_at;
  date.textContent = getFormattedDate(event.starred_at);

  metadata.append(language, stars);
  item.append(link, description, metadata, date);
  return item;
}

function getStarredRepositories(events) {
  if (!Array.isArray(events)) {
    throw new Error("events.json debe contener un array");
  }

  return events.filter(isValidRepositoryEvent);
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`La solicitud falló (${response.status})`);
    }

    const events = await response.json();
    const starredRepositories = getStarredRepositories(events);

    repositoryList.replaceChildren(
      ...starredRepositories.map(createRepositoryItem)
    );

    const countLabel = starredRepositories.length === 1 ? "1 repositorio" : `${starredRepositories.length} repositorios`;
    repoCount.textContent = countLabel;
    loadMessage.textContent = starredRepositories.length
      ? ""
      : "Todavía no hay repositorios en este registro.";
  } catch (error) {
    repoCount.textContent = "";
    loadMessage.textContent = "No se pudieron cargar los repositorios. Inténtalo de nuevo más tarde.";
    console.error("Error al cargar events.json:", error);
  }
}

loadRepositories();
