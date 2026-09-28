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
  stars.textContent = `★ ${numberFormat.format(repo.stars)}`;

  const date = document.createElement("time");
  date.className = "repository-date";
  date.dateTime = event.starred_at;
  date.textContent = `Marcado ${dateFormat.format(new Date(event.starred_at))}`;

  metadata.append(language, stars);
  item.append(link, description, metadata, date);
  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`La solicitud falló (${response.status})`);
    }

    const events = await response.json();
    const starredRepositories = events.filter((event) => event.type === "starred");

    repositoryList.replaceChildren(
      ...starredRepositories.map(createRepositoryItem)
    );
    repoCount.textContent = `${starredRepositories.length} repositorios`;
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