const apiTestMode = false;
const showAPIData = false;
const baseSpacexURL = apiTestMode ? "http://localhost:3000/" : "https://api.spacexdata.com/v4/";

function dropHandler(event) {
  const id = event.dataTransfer.getData("text/plain");
  const droppedElement = document.querySelector(`[data-id="${id}"]`);
  if (assembly.add(droppedElement)) {
    const div = document.createElement("div");
    div.className = "mission-part";
    const img = document.createElement("img");
    img.className = "mission-part-img";
    img.src = droppedElement.dataset.image;
    div.append(img);
    document.querySelector(".mission-assembly").append(div);
  }

}

function dragoverHandler(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function dragstartHandler(event) {
  event.dataTransfer.setData("text/plain", event.target.dataset.id);
  event.dataTransfer.dropEffect = "copy";
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
  row.dataset.name = rocket.name;
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
    + `<td>${item.asds_landings}</td>`
    + `<td>${item.last_update}</td>`;
  row.dataset.part = "booster";
  row.dataset.id = item.id;
  row.dataset.name = item.serial;
  row.dataset.image = null;
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
  row.dataset.name = item.name;
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

  const mission = [];
  return {
    add: (element) => {
      console.log("MISSION:", mission)
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
    addCrew: (newCrew) => mission.crew.push(newCrew),
    deleteCrew: (oldCrew) => mission.crew = mission.crew.filter(item => item != oldCrew)
  }
}();

const allowPart = (mission, name) => {
  let rocketPart = partReady(mission, "rocket");
  switch (name) {
    case "rocket":
      if (rocketPart) {
        alert("Sorry, only 1 rocket allowed per mission!");
        return false;
      }
      break;
    case "booster":
      if (!rocketPart) {
        alert("Please pick a rocket before you pick a booster.")
        return false;
      }
      else {
        if (starshipReady(rocketPart)) {
          alert("Sorry, Starship rocket needs no boosters!");
          return false;
        }
        if ( (falconHeavyReady(rocketPart) && threeBoosters(mission))
              || (!falconHeavyReady(rocketPart) && partReady(mission, "booster")) ) {
          alert("No more boosters are needed for this mission!");
          return false;
        }
      }
      break;
    case "capsule":
      let boosterPart = partReady(mission, "booster");
      if (starshipReady(rocketPart)) {
        alert("Sorry, Starship rocket has its own capsule!");
        return false;
      }
      if (!boosterPart) {
        alert("Please pick a booster before you pick a capsule.")
        return false;
      }
      else {
        if (falconHeavyReady(rocketPart) && !threeBoosters(mission)) {
          alert("Falcon heavy requires 3 boosters, please pick more boosters!")
          return false;
        }
        if (partReady(mission, "capsule")) {
          alert("Sorry, only 1 capsule allowed per mission!");
          return false;
        }
      }
      break;
    case "astronaut":
      let capsulePart = partReady(mission, "capsule");
      if (capsulePart) {
        if (capsulePart.name.toLowerCase().includes("cargo")) {
          alert("Cargo Dragon has no seats for astronauts!");
          return false;
        }
      } else if (!rocketPart || !starshipReady(rocketPart)) {
        alert("Please pick a capsule before you pick astronauts");
        return false;
      }
      if (countAstronauts === 3) {
        alert("Sorry, no more than 3 astronauts allowed per mission!");
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
  let astroCount = mission.reduce(function(count, element) {
    element.part === "astronaut" ? count += 1 : null;
    return count;
  }, 0)
  return astroCount;
}

const threeBoosters = (mission) => {
  let boosterCount = mission.reduce(function(count, element) {
    element.part === "booster" ? count += 1 : null;
    return count;
  }, 0)
  return boosterCount < 3 ? false : true;  
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
