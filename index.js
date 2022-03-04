// Set apiTestMode... to false to use a test endpoint.
// For rockets, boosters, and capsules, the test endpoint is a local json server.
// For astronauts, the test endpoint is on Launch Library.
const apiTestModeSpaceX = true;
const apiTestModeAstros = true;

// Set showAPIData to console.log the result of each API fetch
const showAPIData = false;
const baseSpacexURL = apiTestModeSpaceX ? "http://localhost:3000/" : "https://api.spacexdata.com/v4/";

const MAX_ASTRONAUTS = 3;   // only allow 3 astroanauts on a mission

/* ++++ Messaging ++++ 
  Messages are shown at the top of the window to provide instructions,
  notices and alerts, etc.
*/
const showStandardMessage = () => {
  showMessage("info", "To build a Mission, drag parts (a rocket, booster(s), a capsule, and astronauts) to the Vehicle Assembly Building.")
}

const showNotice = (part, partName) => {
  console.log(part, partName);
  switch (part) {
    case "rocket":
      if (partName === "Falcon Heavy") {
        showMessage("notice", "Please note, the Falcon Heavy rocket requires 3 boosters");
        return;
      }
      break;
    case "capsule":
      if (partName.slice(0, 5) === "Cargo") {
        showMessage("notice", "CONGRATULATIONS, You are ready to blast-off (Cargo Dragon has no seats for Astronauts)!");
        return;
      }
      break;
    case "astronaut":
      if (mission.capsuleFull()) {
        showMessage("notice", "CONGRATULATIONS, You are ready to blast-off!");
        return;
      }
      break;
  }
  showStandardMessage();
}

const showMessage = (type, text) => {
  // display the message and clear background color
  const el = document.querySelector(".message");
  el.textContent = text;
  el.classList.remove("message-alert", "message-info", "message-notice");
  // add background color
  switch (type) {
    case "alert":
      el.classList.add("message-alert");
      break;
    case "info":
      el.classList.add("message-info");
      break;
    case "notice":
      el.classList.add("message-notice")
      break;
    case "error":
      el.classList.add("message-error")
      break;    
  }
}

/* ++++ Drag and Drop handlers ++++
  Drag parts from parts list to the Vehicle Assembly Building
  Minimum requirements for drag/drop functionality are an event listener
  for "drop" and "dragover"
  The dragStartHandler is added to each row in the parts lists at time of render
  The id of the element to be dragged is set in the event data transfer
*/
const initDragDrop = () => {
  let el = document.querySelector(".assembly");
  el.addEventListener("drop", dropHandler);
  el.addEventListener("dragover", dragoverHandler);
}

const dragstartHandler = (event) => {
  event.dataTransfer.setData("text/plain", event.target.dataset.id);
  event.dataTransfer.dropEffect = "copy";
}

const dragoverHandler = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

const dropHandler = (event) => {
  const id = event.dataTransfer.getData("text/plain");
  const dropEl = document.querySelector(`[data-id="${id}"]`);
  // add the part, then render it in the mission area
  if (mission.add(dropEl)) {
    renderMission(dropEl);
//    refreshAfterDrag(dropEl.dataset.part);
  }
}

const clickRowHandler = (event) => {
  if (event.target.nodeName === "TD") {
    const id = event.target.parentElement.dataset.id;
    const dropEl = document.querySelector(`[data-id="${id}"]`);
    if (mission.add(dropEl)) {
      renderMission(dropEl);
    }
  }
}

/*
refreshAfterDrag() has been deprecated!
It refreshes a table of parts, removing the hidden part that was just added to the mission. I coded this after seeing that on the Safari browser a gap was left in the table where the row was hidden; Chrome automatically removed that gap when the row was hidden.
refreshAfterDrag() works perfectly, except that when the user Resets or Deletes, the data for that hidden row no longer exists!
I discovered a better way to resolve the Safari issue - instead of hiding rows using the visibility property, use display: none - see row-hidden in index.css  
*/
const refreshAfterDrag = (partName) => {
  // partName is rocket, booster, etc. table an id partName-body 
  const tableBody = document.querySelector(`#${partName}s-body`);
  let rows = Array.from(tableBody.rows);
  tableBody.innerHTML = "";
  rows.forEach(row => 
    row.classList.contains("row-hidden")
    ? null
    : tableBody.append(row)
  );
}

/* ++++ Button Handlers ++++ */
const clickResetHandler = () => {
  mission.reset();
  //* backup astronauts list to first page
  while (!astroCache.onFirstPage()) {
    astroCache.prevPage();
  }
}

const clickDeleteHandler = () => {
  mission.deleteLastPart();
  showStandardMessage();
}

const clickNextHandler = (event) => {
  astroCache.nextPage();
}

const clickPrevHandler = (event) => {
  astroCache.prevPage();
}

const toggleNavButtons = (enable) => {
  // Always disable the nav buttons after click to give visible feedback to user
  //  and to avoid conflict with async fetch (clicking next more than once).
  // Enable the buttons if right conditions are met.
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

/* ++++ Render ++++ */
const renderMission = (artifact) => {
  if (artifact.dataset.part === "booster") {
    // there are no images for boosters, so simply show booster name with rocket name  
    const div = document.querySelector(".mission-caption-rocket");
    div.innerHTML = div.innerHTML + `<span class="booster-part">${artifact.dataset.name}</span>`
  }
  else {
    const div = document.createElement("div");
    div.className = "mission-part";
    const img = document.createElement("img");
    img.className = "mission-part-img";
    img.src = artifact.dataset.image;
    div.append(img);
    const captionDiv = document.createElement("div");
    captionDiv.innerHTML = `
    <span class="mission-caption-${artifact.dataset.part}">${artifact.dataset.name}</span>`
    div.append(captionDiv);
    document.querySelector(".mission-stack").append(div);
  }
  // hide the row in the parts list, show message, and enable mission buttons
  artifact.classList.add("row-hidden");
  showNotice(artifact.dataset.part, artifact.dataset.name);
  document.querySelector("#btn-reset-mission").removeAttribute("disabled")
  document.querySelector("#btn-delete-mission").removeAttribute("disabled")
}

const renderRockets = (rockets) => {
  const tableBody = document.querySelector("#rockets-body");
  tableBody.innerHTML = "";
  rockets.forEach(rocket => {
    renderRocket(rocket, tableBody.insertRow());
  })
}

const renderRocket = (rocket, row) => {
  initRow(row, "rocket", rocket.id, rocket.name, rocket.flickr_images[0]);
  row.innerHTML = `<td>${rocket.name}</td>`
    // + `<td>${rocket.cost_per_launch}</td>`
    + `<td>${rocket.engines.type}(${rocket.engines.number})</td>`
    + `<td>${rocket.first_flight}</td>`;
  //    + `<td>${rocket.success_rate_pct}</td>`;
}

const renderBoosters = (cores) => {
  showAPIData ? console.log("CORES from API", cores) : null;
  const tableBody = document.querySelector("#boosters-body");
  tableBody.innerHTML = "";
  cores.forEach(core => renderBooster(core, tableBody.insertRow()));
}

const renderBooster = (item, row) => {
  initRow(row, "booster", item.id, item.serial, null);
  row.innerHTML = `<td>${item.serial}</td>`
    + `<td>${item.reuse_count}</td>`
    // + `<td>${item.asds_landings}</td>`
    + `<td>${item.last_update}</td>`;
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
  // Capsule combines attributes from 2 endpoints "capsule" and "dragons" 
  let dragonType = `${dragon.crew_capacity > 0 ? "Crew" : "Cargo"} ${item.type}`
  initRow(row, "capsule", item.id, `${dragonType} ${item.serial}`, dragon.flickr_images[0]);
  row.innerHTML = `<td>${dragonType}</td>`
    //    + `<td>${dragon.crew_capacity > 0 ? "crew" : "cargo"}</td>`
    //    + `<td>${dragon.first_flight}</td>`
    + `<td>${item.serial}</td>`
    + `<td>${item.launches.length}</td>`
    + `<td>${item.water_landings}</td>`;
}

const renderAstronauts = () => {
  astroCache.logStatus("renderAstronauts()");
  showAPIData ? console.log("ASTRONAUTS from API", astroCache.show()) : null;
  const tableBody = document.querySelector("#astronauts-body");
  tableBody.innerHTML = "";
  astroCache.show().forEach(astronaut => {
    renderAstronaut(astronaut, tableBody.insertRow());
  })
  // enable nav buttons 
  toggleNavButtons(true);
}

const renderAstronaut = (item, row) => {
  // for dates, only show the year, full date is really kind of meaningless, all we want to do is give the user an idea of person's age and flight experience
  initRow(row, "astronaut", item.id, item.name, item.profile_image)
  row.innerHTML = `<td>${item.name}</td>`
    + `<td>${item.date_of_birth.slice(0, 4)}</td>`
    + `<td>${item.first_flight.slice(0, 4)}</td>`
    + `<td>${item.last_flight.slice(0, 4)}</td>`;
  // hide the row if astronaut is already included in mission
  if (mission.includes(item.id)) {
    row.classList.add("row-hidden");
  }
}

const initRow = (row, part, id, name, image) => {
  row.dataset.part = part;
  row.dataset.id = id;
  row.dataset.name = name;
  row.dataset.image = image;
  row.className = `${part}-row`
  row.draggable = true;
//  row.addEventListener("dragstart", dragstartHandler);
}

// mission() maintains mission parts in partsList[] after user drags and drops
const mission = function () {
  const partsList = [];
  return {
    add: (element) => {
      // check first to see if the part is allowed
      if (allowPart(partsList, element.dataset.part)) {
        partsList.push({
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
    show: () => partsList,
    // includes find() must use == as partsList id is string, but value passed from render is number
    includes: (partId) => partsList.find(part => part.id == partId),
    reset: () => {
      partsList.forEach(part => mission.unhidePart(part.id));    // make all parts visible 
      partsList.length = 0;     // delete all parts
      document.querySelector(".mission-stack").innerHTML = "";  // clear the DOM
      showStandardMessage();
    },
    capsuleFull: () => countAstronauts(partsList) === MAX_ASTRONAUTS,
    deleteLastPart: () => {
      // delete the last part picked for the mission 
      // boosters have to be handled as a special case since they are part of the reocket
      let deletedPart = partsList.pop();
      let boosterOrMission = deletedPart.part === "booster" ? "booster" : "mission";
      // remove the part from the DOM
      Array.from(document.querySelectorAll(`.${boosterOrMission}-part`)).pop().remove();
      // unhide the row in the list for that part
      mission.unhidePart(deletedPart.id);
      // remove it from the list
    },
    unhidePart: (partId) => {
      // can only unhide a part if it is currently rendered, which may not be the case for 
      //  an astronaut picked from another page in the cache that is not the current one shown
      const el = document.querySelector(`[data-id="${partId}"]`);
      el ? el.classList.remove("row-hidden") : null;
    },
  }
}();

// allowPart() validates if the part is compatible with mission
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
          showMessage("alert", "No more boosters are needed for this rocket!");
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
          // changed messaging logic, this message will never dispaly, 
          // but left it in just in case we decide to use it later
          showMessage("alert", "Cargo Dragon has no seats for astronauts!");
          return false;
        }
      } else if (!rocketPart || !starshipReady(rocketPart)) {
        showMessage("alert", "Please pick a capsule before you pick astronauts.");
        return false;
      }
      if (countAstronauts(mission) === MAX_ASTRONAUTS) {
        showMessage("alert", `Sorry, no more than ${MAX_ASTRONAUTS} astronauts allowed per mission!`);
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
}

// allowPart helper functions
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

/*
configurator() filters mission parts after fetch mostly to make sure part has been used
  in a prior launch. Thius was intended to be the only filtering but additional review 
  of the API data reduced the significance of prior launches and required some additional 
  criteria to be added. The goal is to try to ensure the app provides a realistic feel,
  for example, don't list a booster that was destroyed in a prior launch or lost at sea.   
*/
const configurator = function () {
  const priorLaunches = [];
  return {
    push: (launch) => priorLaunches.push(launch),
    // exclude "falcon 1" which has an extremely low success rate 
    rocket: (collection) => collection.filter((item) => item.name != "Falcon 1"),
    booster: (collection) => {
      return collection.filter((item) =>
        // include only active boosters that have been in a prior launch
        (item.status === "unknown" || item.status === "active") && priorLaunches.find(launch => item.id === launch.coreId)
      );
    },
    // include only active capsules tyhat have prior water landings
    capsule: (collection) => collection.filter((item) => item.status === "active" && parseInt(item.water_landings, 10) > 0)
  }
}();

/* initPriorLaunches() supports confurator()  */
const initPriorLaunches = (launches) => {
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

/* astroCache() provides caching and other logic for astronauts.
  Eventually a future release of this app will require caching for all parts
  as their volume increases with more launch activity.
*/
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
      if (!astroCache.isFullCache() && renderPage > pages.length - 1) {
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


/* ++++ API interface +++ */
// buildAstronautURL() defines test or live endpoint and filtering criteria
const buildAstronautURL = () => {
  // api provides a testing endpoint with slightly stale data, use that when testing.
  return url = `https://${apiTestModeAstros ? "lldev" : "ll"}.thespacedevs.com/2.2.0/astronaut/?format=json`
    + "&active=1"   // this doesn't seem to work, so also do it on configurator
    + "&nationality=American"
    + "&ordering=name"
    + `&limit=${astroCache.apiLimit()}` // 100 appears to be the max
    + `&offset=${astroCache.nextOffset()}`;
}

// getAstronauts() is recursive since a single fetch does not get enough astros to fill the cache 
const getAstronauts = () => {
  showMessage("alert", "Please wait, fetching astronauts ...")
  fetch(buildAstronautURL())
    .then(resp => resp.json())
    .then(result => {
      console.log("FETCH offset = ", astroCache.nextOffset());
      astroCache.cacheAstros(result.results);
      // keep fetching until cache page is full AND there is still API data 
      if (!astroCache.isFullPage() && result.next) {
        getAstronauts();
      } else {
        showStandardMessage();
        renderAstronauts();
      }
    })
    .catch((error) => {
      showMessage("error", `GET error: ${buildAstronautURL}`);
    });
}

const fetchParts = () => {
  showMessage("alert", "Please wait, fetching rocket parts ...")
  fetch(baseSpacexURL + "launches")
  .then(resp => resp.json())
  .then(result => {
    initPriorLaunches(result);
    fetch(baseSpacexURL + "rockets")
      .then(resp => resp.json())
      .then(result => renderRockets(configurator.rocket(result)));
    fetch(baseSpacexURL + "cores")
      .then(resp => resp.json())
      .then(result => renderBoosters(configurator.booster(result)));
    fetch(baseSpacexURL + "capsules")
      .then(resp => resp.json())
      .then(capsulesData => {
        fetch(baseSpacexURL + "dragons")
          .then(resp => resp.json())
          .then(dragonsData => renderCapsules(configurator.capsule(capsulesData), dragonsData));
      });
    toggleNavButtons(false);
    getAstronauts();
  })
  // most likely error is local json server not running, when in test mode
  //  so only bothering to catch errors on the first fetch
  .catch((error) => {
    showMessage("error", `GET error: ${baseSpacexURL}`);
  });
}

const initHandlers = () => {
  initDragDrop();
  document.querySelector("#btn-astro-prev").addEventListener("click", clickPrevHandler)
  document.querySelector("#btn-astro-next").addEventListener("click", clickNextHandler)
  document.querySelector("#btn-reset-mission").addEventListener("click", clickResetHandler);
  document.querySelector("#btn-delete-mission").addEventListener("click", clickDeleteHandler);
  document.querySelector(".main-container").addEventListener("click", clickRowHandler);
  document.querySelector(".main-container").addEventListener("dragstart", dragstartHandler);  
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("SPACEX base endpoint = ", baseSpacexURL + "launches")
  console.log("LAUNCH LIBRARY endpoint = ", buildAstronautURL(0))
  fetchParts();
  initHandlers();
})

