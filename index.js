// Set apiTestMode to false to use a test endpoint.
// For everything except astronauts, the test endpoint is a local json server.
// For astronatust, the test endpoint is on Launch Library.
const apiTestMode = false;

// Set showAPIData to console.log the result of each API fetch
const showAPIData = false;
const baseSpacexURL = apiTestMode ? "http://localhost:3000/" : "https://api.spacexdata.com/v4/";


/*
Drag parts from parts list to the Vehicle Assembly Building
Minimum requirements for drag/drop functionality are an event listener
 for "drop" and "dragover"
The dragStartHandler is added to each row in the parts lists at time of render
 The id of the element to be dragged is set in the event data transfer
*/

function initDragDrop() {
  let el = document.querySelector(".assembly");
  el.addEventListener("drop", dropHandler);
  el.addEventListener("dragover", dragoverHandler);

}

function dragstartHandler(event) {
  showMessage("info", "Drop your part on the Vehicle Assembly Building");
  event.dataTransfer.setData("text/plain", event.target.dataset.id);
  event.dataTransfer.dropEffect = "copy";

}

function dragoverHandler(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";

}

function dropHandler(event) {
  const id = event.dataTransfer.getData("text/plain");
  const dropEl = document.querySelector(`[data-id="${id}"]`);
  // add the part, then render it in the mission area
  if (assembly.add(dropEl)) {
    renderMission(dropEl);
  }
}

const renderMission = (artifact) => {
  if (artifact.dataset.part === "booster") {
    const div = document.querySelector(".mission-caption-rocket");
    div.textContent = `${div.textContent} + ${artifact.dataset.name}`
  }
  else {
    const div = document.createElement("div");
    div.className = "mission-part";
    const img = document.createElement("img");
    img.className = "mission-part-img";
    img.src = artifact.dataset.image;
    div.append(img);
    const captionDiv = document.createElement("div");
    captionDiv.className = `mission-caption-${artifact.dataset.part}`
    captionDiv.textContent = artifact.dataset.name;
    div.append(captionDiv);
    document.querySelector(".mission").append(div);
  }
  // hide the row in the parts list
  artifact.classList.add("row-hidden");
  showNotice(artifact, artifact.dataset.name);

}


const renderRockets = (rockets) => {
  const tableBody = document.querySelector("#rockets-body");
  tableBody.innerHTML = "";
  rockets.forEach(rocket => {
    renderRocket(rocket, tableBody.insertRow());
  })
}

const renderRocket = (rocket, row) => {
  row.innerHTML = `<td>${rocket.name}</td>`
    + `<td>${rocket.cost_per_launch}</td>`
    + `<td>${rocket.engines.type}(${rocket.engines.number})</td>`
    + `<td>${rocket.first_flight}</td>`
    + `<td>${rocket.success_rate_pct}</td>`;
  row.dataset.part = "rocket";
  row.dataset.id = rocket.id;
  row.dataset.name = rocket.name;
  row.dataset.image = rocket.flickr_images[0];
  row.className = "rocket-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
}

const renderCores = (cores) => {
  // note that the API uses the term "core" but the user-interface uses "booster"
  showAPIData ? console.log("CORES from API", cores) : null;
  const tableBody = document.querySelector("#cores-body");
  tableBody.innerHTML = "";
  cores.forEach(core => renderCore(core, tableBody.insertRow()));
}


const renderCore = (item, row) => {
  row.innerHTML = `<td>${item.serial}</td>`
    + `<td>${item.reuse_count}</td>`
    + `<td>${item.asds_landings}</td>`
    + `<td>${item.last_update}</td>`;
  row.dataset.part = "booster";
  row.dataset.id = item.id;
  row.dataset.name = item.serial;
  row.dataset.image = null;
  row.className = "booster-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);

}

const renderCapsules = (capsules, dragons) => {
  showAPIData ? console.log("DRAGONS from API", dragons) : null;
  showAPIData ? console.log("CAPSULES from API", capsules) : null;

  const tableBody = document.querySelector("#capsules-body");
  tableBody.innerHTML = "";
  capsules.forEach(capsule => {
    // capsule.type of "Dragon n.x" matches to dragon.name of "Dragon 1" or "Dragon 2"
    const dragon = dragons.find(item => item.name === capsule.type.slice(0, item.name.length))
    renderCapsule(capsule, dragon, tableBody.insertRow());
  })
}

const renderCapsule = (item, dragon, row) => {
  /* Capsule combines attributes from 2 endpoints "capsule" and "dragons" 
  */
  let dragonType = `${dragon.crew_capacity > 0 ? "Crew" : "Cargo"} ${item.type}`
  row.innerHTML = `<td>${dragonType}</td>`
    //    + `<td>${dragon.crew_capacity > 0 ? "crew" : "cargo"}</td>`
    //    + `<td>${dragon.first_flight}</td>`
    + `<td>${item.serial}</td>`
    + `<td>${item.launches.length}</td>`
    + `<td>${item.water_landings}</td>`;
  row.dataset.id = item.id;
  row.dataset.part = "capsule"
  row.dataset.name = `${dragonType} ${item.serial}`
  row.dataset.image = dragon.flickr_images[0];
  row.className = "capsule-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
}

const renderAstronauts = () => {
  astroCache.logStatus("renderAstronauts()");
  showAPIData ? console.log("ASTRONAUTS from API", astroCache.show()) : null;
  const tableBody = document.querySelector("#astros-body");
  tableBody.innerHTML = "";
  astroCache.show().forEach(astronaut => {
    renderAstronaut(astronaut, tableBody.insertRow());
  })
  // enable nav buttons
  toggleNavButtons(true);

}

const renderAstronaut = (item, row) => {
  // for dates, only show the year, full date is really kind of meaningless, all we want to do is 
  // give the user an idea of person's age and flight experience
  row.innerHTML = `<td>${item.name}</td>`
    + `<td>${item.date_of_birth.slice(0, 4)}</td>`
    + `<td>${item.first_flight.slice(0, 4)}</td>`
    + `<td>${item.last_flight.slice(0, 4)}</td>`;
  row.dataset.part = "astronaut";
  row.dataset.id = item.id;
  row.dataset.name = item.name;
  row.dataset.image = item.profile_image;
  row.className = "astronaut-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // hide the row if astronaut is already included in mission
  if (assembly.includes(item.id)) {
    console.log("HIDE HIDE HIDE")
    row.classList.add("row-hidden");
  }
}

const toggleNavButtons = (enable) => {
  // always disable the nav buttons after click to give visible feedback to user
  //  and to avoid conflict with async fetch (clicking next more than once)
  // enable the buttons if right conditions are met
  if (enable) {
    if (!astroCache.onFirstPage()) {
      document.querySelector("#btn-astro-prev").removeAttribute("disabled")
    }
    if (!astroCache.onLastPage()) {
      document.querySelector("#btn-astro-next").removeAttribute("disabled")
    }
  }
  // disable the buttons 
  else {
    document.querySelector("#btn-astro-prev").setAttribute("disabled", true)
    document.querySelector("#btn-astro-next").setAttribute("disabled", true)
  }

}

function handleClickNext(event) {
  astroCache.nextPage();
}

function handleClickPrev(event) {
  astroCache.prevPage();
}


const assembly = function () {
  // assembly() maintains mission parts in mission[] after user drags and drops
  const mission = [];
  return {
    add: (element) => {
      console.log("MISSION:", mission)
      // check first to see if the part is allowed
      if (allowPart(mission, element.dataset.part)) {
        mission.push({
          id: element.dataset.id,
          part: element.dataset.part,
          name: element.dataset.name,
          image: element.dataset.part
        })
        return true;
      }
      else {
        return false;
      }
    },
    delete: (partName) => delete mission[partName],
    show: () => mission,
    // includes find() must use == as mission id is string, but value passed from render is number
    includes: (partId) => mission.find(part => part.id == partId),
  }
}();

const showMessage = (type, text) => {
  const el = document.querySelector(".message");
  el.textContent = text;
  el.classList.remove("message-alert", "message-info", "message-notice");
  switch (type) {
    case "alert":
      el.classList.add("message-alert");
      break;
    case "info":
      el.classList.add("message-info");
      break;
    case "notice":
      el.classList.add("message-notice")
  }
}

const showNotice = (part, partName) => {
  if (partName === "Falcon Heavy") {
    showMessage("notice", "Please note, the Falcon Heavy rocket requires 3 boosters");
  }
}

const allowPart = (mission, name) => {
  let rocketPart = partReady(mission, "rocket");
  switch (name) {
    case "rocket":
      if (rocketPart) {
        showMessage("alert", "Sorry, only 1 rocket allowed per mission!");
        return false;
      }
      break;
    case "booster":
      if (!rocketPart) {
        showMessage("alert", "Please pick a rocket before you pick a booster.")
        return false;
      }
      else {
        if (starshipReady(rocketPart)) {
          showMessage("alert", "Sorry, Starship rocket needs no boosters!");
          return false;
        }
        if ((falconHeavyReady(rocketPart) && threeBoosters(mission))
          || (!falconHeavyReady(rocketPart) && partReady(mission, "booster"))) {
          showMessage("alert", "No more boosters are needed for this mission!");
          return false;
        }
      }
      break;
    case "capsule":
      let boosterPart = partReady(mission, "booster");
      if (starshipReady(rocketPart)) {
        showMessage("alert", "Sorry, Starship rocket has its own capsule!");
        return false;
      }
      if (!boosterPart) {
        showMessage("alert", "Please pick a booster before you pick a capsule.")
        return false;
      }
      else {
        if (falconHeavyReady(rocketPart) && !threeBoosters(mission)) {
          showMessage("alert", "Falcon Heavy requires 3 boosters, please pick more boosters!")
          return false;
        }
        if (partReady(mission, "capsule")) {
          showMessage("alert", "Sorry, only 1 capsule allowed per mission!");
          return false;
        }
      }
      break;
    case "astronaut":
      let capsulePart = partReady(mission, "capsule");
      if (capsulePart) {
        if (capsulePart.name.toLowerCase().includes("cargo")) {
          showMessage("alert", "Cargo Dragon has no seats for astronauts!");
          return false;
        }
      } else if (!rocketPart || !starshipReady(rocketPart)) {
        showMessage("alert", "Please pick a capsule before you pick astronauts");
        return false;
      }
      if (countAstronauts(mission) === 3) {
        showMessage("alert", "Sorry, no more than 3 astronauts allowed per mission!");
        return false;
      }
      break;
    default:
      return false;
  }
  return true;

}

const partReady = (mission, part) => mission.find(item => item.part === part);

const starshipReady = (rocket) => rocket.name.toLowerCase() === "starship";

const falconHeavyReady = (rocket) => rocket.name.toLowerCase() === "falcon heavy";

const countAstronauts = (mission) => {
  let astroCount = mission.reduce(function (count, element) {
    element.part.toLowerCase() === "astronaut" ? count += 1 : null;
    return count;
  }, 0)
  return astroCount;
}

const threeBoosters = (mission) => {
  let boosterCount = mission.reduce(function (count, element) {
    element.part === "booster" ? count += 1 : null;
    return count;
  }, 0)
  return boosterCount < 3 ? false : true;
}

const configurator = function () {
  /*
    configurator() filters mission parts so that user-interface lists  
      rockets, boosters, etc. that appear practical for assembling a mission.  
    I originally thought that it would be sufficient to select parts that were
      used on prior missions, but after further research more filter critera
      were needed.
  */
  const priorLaunches = [];
  return {
    push: (launch) => priorLaunches.push(launch),
    rocket: (collection) => collection.filter((item) => item.name != "Falcon 1"),
    core: (collection) => {
      return collection.filter((item) => {
        return (item.status === "unknown" || item.status === "active")
          && priorLaunches.find(launch => item.id === launch.coreId)
      });
    },
    capsule: (collection) => collection.filter((item) => item.status === "active" && parseInt(item.water_landings, 10) > 0)
    // astronaut: (collection) => collection.filter(item => item.status.name === "Active" && item.first_flight)
  }

}();

const astroCache = function () {
  const MAX_PAGE_SIZE = 20;
  const API_LIMIT = 100;
  let offsetCounter = 0;
  let cachePage = 0;
  let renderPage = 0;
  let fullCache = false;
  let fullPage = false;

  // initialize the first page of the cache
  const pages = [{
    offset: offsetCounter,
    astros: []
  }];

  return {
    // only include astronauts who have flown
    // used to also filter for active, but this is now part of fetch -- item.status.name === "Active" 
    apiLimit: () => API_LIMIT,
    nextOffset: () => offsetCounter,
    cacheAstros: (collection) => {
      for (const item of collection) {
        offsetCounter++;
        if (item.status.name === "Active" && item.first_flight) {
          pages[cachePage].astros.push(item);
          if (pages[cachePage].astros.length === MAX_PAGE_SIZE) {
            fullPage = true;
            return;
          }
        }
      }
      // got to end of collection, if it is less than API_LIMIT then there's
      //   no more api data, so set fullCache to avoid further fetches
      if (collection.length < API_LIMIT) {
        fullPage = true;
        fullCache = true;
      }
    },
    onLastPage: () => !astroCache.isFullCache() || renderPage != pages.length - 1 ? false : true,
    onFirstPage: () => renderPage === 0 ? true : false,
    isFullPage: () => fullPage,
    isFullCache: () => fullCache,
    show: () => pages[renderPage].astros,
    advanceCache: () => {
      ++cachePage;
      fullPage = false;
      pages.push({
        offset: offsetCounter,
        astros: []
      });
    },
    nextPage: () => {
      toggleNavButtons(false);
      renderPage++;
      if (!astroCache.isFullCache()) {
        astroCache.advanceCache();
        getAstronauts();
      } else {
        renderAstronauts();
      }
    },
    prevPage: () => {
      toggleNavButtons(false);
      renderPage--;
      renderAstronauts();
    },
    logStatus: (message) => {
      console.log(`${message}\noffsetCounter=${offsetCounter}\ncachePage=${cachePage} renderPage=${renderPage}\nfullCache=${fullCache} fullPage=${fullPage}`);
      pages.forEach(page => console.log(`${page.offset} = ${page.astros[0].name}`))
    }
  }

}();

const initPriorLaunches = (launches) => {
  /* 
    Populate past launches to allow configuration of mission parts.
    Include only successful launches.
    Simplify the data structure, e.g. avoid arrays when array only has 1 element.
  */
  showAPIData ? console.log("LAUNCHES from API", launches) : null

  for (const launch of launches) {
    if (launch.success) {
      const prior = {
        launchId: launch.id,
        capsule: launch.capsules.length ? launch.capsules[0] : null,
        rocket: launch.rocket,
        crew: launch.crew,
        payloadsCount: launch.payloads.length,
        launchpad: launch.launchpad,
        flightNumber: launch.flight_number,
      }
      if (launch.cores.length) {
        prior.coreId = launch.cores[0].core;
        prior.coreFlightNumber = launch.cores[0].flight;
        prior.coreReusedFlag = launch.cores[0].reused;
      }
      configurator.push(prior);
    }
  }
}

const buildAstronautURL = () => {
  // api provides a testing endpoint with slightly stale data, use that when testing.
  return url = `https://${apiTestMode ? "lldev" : "ll"}.thespacedevs.com/2.2.0/astronaut/?format=json`
    + "&active=1"   // this doesn't seem to work, so also do it on configurator
    + "&nationality=American"
    + "&ordering=name"
    + `&limit=${astroCache.apiLimit()}` // 100 appears to be the max
    + `&offset=${astroCache.nextOffset()}`;
}

const getAstronauts = () => {
  // this needs to be recursive since a single fetch does not get enough astros
  //   to fill the cache 
  fetch(buildAstronautURL())
    .then(resp => resp.json())
    .then(result => {
      console.log("FETCH offset = ", astroCache.nextOffset());
      astroCache.cacheAstros(result.results);
      // keep fetching until cache page is full AND there is still API data 
      if (!astroCache.isFullPage() && result.next) {
        getAstronauts();
      } else {
        renderAstronauts();
      }
    });

}

document.addEventListener("DOMContentLoaded", (e) => {
  console.log("SPACEX base endpoint = ", baseSpacexURL + "launches")
  console.log("LAUNCH LIBRARY endpoint = ", buildAstronautURL(0))

  fetch(baseSpacexURL + "launches")
    .then(resp => resp.json())
    .then(result => {
      initPriorLaunches(result);
      fetch(baseSpacexURL + "rockets")
        .then(resp => resp.json())
        .then(result => renderRockets(configurator.rocket(result)));
      fetch(baseSpacexURL + "cores")
        .then(resp => resp.json())
        .then(result => renderCores(configurator.core(result)));
      fetch(baseSpacexURL + "capsules")
        .then(resp => resp.json())
        .then(capsulesData => {
          fetch(baseSpacexURL + "dragons")
            .then(resp => resp.json())
            .then(dragonsData => renderCapsules(configurator.capsule(capsulesData), dragonsData));
        });
      toggleNavButtons(false);
      getAstronauts();
    });

  initDragDrop();

  document.querySelector("#btn-astro-prev").addEventListener("click", handleClickPrev)
  document.querySelector("#btn-astro-next").addEventListener("click", handleClickNext)

})