const apiTestMode = true;
const showAPIData = true;
const baseSpacexURL = apiTestMode ? "http://localhost:3000/" : "https://api.spacexdata.com/v4/";

function dropHandler(event) {
  // event.preventDefault();
  const id = event.dataTransfer.getData("text/plain");
  if (assembly.add("rocket", id)) {
    console.log("dropped id = ", id);
    const dropped = document.querySelector(`[data-rocket-id="${id}"]`);
    const imgSource = dropped.dataset.rocketImage;
    const div = document.createElement("div");
    div.className = "mission-part";
    const img = document.createElement("img");
    img.className = "mission-part-img";
    img.src = imgSource;
    div.append(img);
    document.querySelector(".mission-assembly").append(div);
  }
}

function dragoverHandler(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function dragstartHandler(event) {
  event.dataTransfer.setData("text/plain", event.target.dataset.rocketId);
  event.dataTransfer.dropEffect = "copy";
  console.log(event.target);
}

const buildAstronautURL = () => {
  // api provides a testing endpoint with slightly stale data, use that when testing.
  return url = `https://${apiTestMode ? "lldev" : "ll"}.thespacedevs.com/2.2.0/astronaut/?format=json`
    + "&active=1"
    + "&nationality=American"
    + "&ordering=name"
    + "&limit=100" // 100 appears to be the max
//    + "&offset=100";
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
  row.dataset.image = rocket.flickr_images[0];
  row.className = "rocket-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
}

const renderCores = (cores) => {
  showAPIData ? console.log("CORES from API", cores) : null;
  const tableBody = document.querySelector("#cores-body");
  tableBody.innerHTML = "";
  cores.forEach(core => renderCore(core, tableBody.insertRow()));
}

// serial, flown, landed, note
const renderCore = (item, row) => {
  row.innerHTML = `<td>${item.serial}</td>`
    + `<td>${item.reuse_count}</td>`
    + `<td>${item.asds_landings}</td>`;
    // + `<td>${item.last_update}</td>`;
  row.dataset.part = "booster";
  row.dataset.id = item.id;
  row.className = "booster-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
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
  row.innerHTML = `<td>${item.type}</td>`
    + `<td>${dragon.crew_capacity > 0 ? "crew" : "cargo"}</td>`
//    + `<td>${dragon.first_flight}</td>`
    + `<td>${item.serial}</td>`
    + `<td>${item.launches.length}</td>`
    + `<td>${item.water_landings}</td>`;
  row.dataset.id = item.id;
  row.dataset.part = "capsule"
  row.dataset.image = dragon.flickr_images[0];
  row.className = "capsule-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);
  // row.addEventListener("mouseover", handleRowHover);
}

const renderAstronauts = (astronauts) => {
  showAPIData ? console.log("ASTRONAUTS from API", astronauts) : null;
  const tableBody = document.querySelector("#astros-body");
  tableBody.innerHTML = "";
  astronauts.forEach(astronaut => {
    renderAstronaut(astronaut, tableBody.insertRow());
  })

}

const renderAstronaut = (item, row) => {
  row.innerHTML = `<td>${item.name}</td>`
    + `<td>${item.date_of_birth}</td>`
    + `<td>${item.first_flight}</td>`
    + `<td>${item.last_flight}</td>`;
  row.dataset.part = "astronaut";
  row.dataset.id = item.id;
  row.dataset.image = item.profile_image;
  row.className = "astronaut-row";
  row.draggable = true;
  row.addEventListener("dragstart", dragstartHandler);

}

const assembly = function () {
  /* 
    assembly() maintains mission parts.
    Intializes an empty object with crew array to simplify the logic.
    "crew" is the only key with multiple values.
    Coded another version of this allowing any key to have multiple values
      (value is a string if only 1, or an array if > 1) but code become more 
      complicated and decided instead to do it this way with separate methods
      for adding and deleting crew.
  */
  const mission = { crew: [] };
  return {
    add: (partName, partId) => {
      if (allowPart(mission, partName)) {
        mission[partName] = partId;
        return true;
      }
      else {
        return false;
      }
    },
    delete: (partName) => delete mission[partName],
    show: () => mission,
    addCrew: (newCrew) => mission.crew.push(newCrew),
    deleteCrew: (oldCrew) => mission.crew = mission.crew.filter(item => item != oldCrew)
  }
}();

const allowPart = (mission, name) => {
  /*
    Determine if a part is allowed in the assembly
    Rules for allowing a part are as follows:
      rockets: only 1 allowed
      boosters: 
        requires a rocket
        none allowed if rocket = "Starship", otherwise 1 allowed
      capsules: 
        requires a booster
        same as boosters
      astronauts: 
        requires a capsule
        none allowed if capsule type is "cargo"
        othertwise maximum 3 allowed
  */
  
  switch (name) {
    case "rocket":
      if ("rocket" in mission) {
        alert("Sorry, only 1 rocket allowed per mission!");
        return false;
      }
    case "booster":
      if ("rocket" in mission) {
        if (mission["rocket"].toLowerCase() === "starship") {
          alert("Sorry, Starship rocket has its own booster!");
          return false;
        }
        if ("booster" in mission) {
          alert("Sorry, only 1 booster allowed per mission!");
          return false;
        }
      }
    case "capsule":
      if (mission["rocket"].toLowerCase() === "starship" || "booster" in mission) {
        if ("capsule" in mission) {
          alert("Sorry, only 1 capsule allowed per mission!");
          return false;
        }
      }

    case "astronaut":
      if ("capsule" in mission) {
        if (mission["astronauts"].length === 3) {
          alert("Sorry, no more than 3 astronatus allowed per mission!");
          return false;
        }
      }

    default:
      return true;
  }
}

const configurator = function () {
  /*
    configurator() filters mission parts so user-interface lists  
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
    capsule: (collection) => collection.filter((item) => item.status === "active" && parseInt(item.water_landings, 10) > 0), 
    astronaut: (collection) => collection.filter(item => item.status.name === "Active")
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

document.addEventListener("DOMContentLoaded", (e) => {
  console.log(baseSpacexURL + "launches")

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
    fetch(buildAstronautURL())
    .then(resp => resp.json())
    .then(result => renderAstronauts(configurator.astronaut(result.results)));
  });

  const boxElement = document.querySelector(".box");
  boxElement.addEventListener("drop", dropHandler);
  boxElement.addEventListener("dragover", dragoverHandler);

})
