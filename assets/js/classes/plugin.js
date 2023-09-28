var isLoginUser = false;
const ENDPOINT_URL =
  "https://5fr8r16ski.execute-api.us-east-1.amazonaws.com/stage/dev-api/";

function fetchData(url, method) {
  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 429) {
        // Redirect to /limit-exceeded/ page
        window.location.href = "/limit-exceeded/";
      }
      return response.json();
    })
    .then((data) => {
      // You can perform additional operations with the data here if needed
      return data;
    });
}

function groupByTagsName(data) {
  const groupedData = {};

  data.forEach((item) => {
    const tagTitle = item.tags_data[0]?.title;

    if (!tagTitle) {
      if (!groupedData["Other"]) {
        groupedData["Other"] = [];
      }
      groupedData["Other"].push(item);
    } else {
      if (!groupedData[tagTitle]) {
        groupedData[tagTitle] = [];
      }
      groupedData[tagTitle].push(item);
    }
  });

  return groupedData;
}

function addTosessionStorage(item) {
  // Get the existing list from local storage
  const existingList = JSON.parse(sessionStorage.getItem("items") || "[]");

  // Check if the item already exists in the list
  const isDuplicate = existingList.some(
    (existingItem) =>
      existingItem._id === item._id && existingItem._id === item._id
  );

  // If the item is not a duplicate, add it to the list
  if (!isDuplicate) {
    const newList = [...existingList, item];
    sessionStorage.setItem("items", JSON.stringify(newList));
  }
}
function addTolocalStorage(userRatedSkill) {
  // Get the existing list from local storage
  const existingList = JSON.parse(
    localStorage.getItem("userRatedSkills") || "[]"
  );

  // Check if the userRatedSkill already exists in the list
  const index = existingList.findIndex(
    (existingItem) =>
      existingItem.isot_file_id === userRatedSkill.isot_file_id &&
      existingItem.isot_file_id === userRatedSkill.isot_file_id
  );

  if (index !== -1) {
    // Remove the existing element from the list
    existingList.splice(index, 1);
  }

  // Add the new userRatedSkill to the list
  const newList = [...existingList, userRatedSkill];

  // Save the updated list in localStorage
  localStorage.setItem("userRatedSkills", JSON.stringify(newList));

  console.warn(getListFromlocalStorage());
}

function getListFromlocalStorage() {
  if (localStorage.getItem("userRatedSkills")) {
    return JSON.parse(localStorage.getItem("userRatedSkills"));
  } else {
    return [];
  }
}

// remove item from local storage when the skill isot_file_id is given
function removeItemFromlocalStorage(isot_file_id) {
  const existingList = JSON.parse(
    localStorage.getItem("userRatedSkills") || "[]"
  );
  const index = existingList.findIndex(
    (existingItem) => existingItem.isot_file_id === isot_file_id
  );
  if (index !== -1) {
    // Remove the existing element from the list
    existingList.splice(index, 1);
  }
  // Save the updated list in localStorage
  localStorage.setItem("userRatedSkills", JSON.stringify(existingList));
}

function clearlocalStorage() {
  localStorage.removeItem("userRatedSkills");
}

function getListFromsessionStorage() {
  if (sessionStorage.getItem("items")) {
    return JSON.parse(sessionStorage.getItem("items"));
  } else {
    return [];
  }
}
function clearsessionStorage() {
  sessionStorage.removeItem("items");
}
const removeItemsFromSessionStorageAfterIndex = (index) => {
  const list = getListFromsessionStorage();
  const newList = list.slice(0, index + 1); // Keep the elements up to and including the specified index
  saveListToSessionStorage(newList);
};

const saveListToSessionStorage = (list) => {
  sessionStorage.setItem("items", JSON.stringify(list));
};

class IysSearchPlugin {
  constructor(config) {
    this.config = config;
    this.options = {
      ApiKey: null,
      divID: null,
      searchIimit: 10,
      onSearchSkillClick: null,
      selectedSkilldiv: null,
    };
    this.selectedSkills = [];
    if (typeof config == "object") {
      this.options = {
        ...this.options,
        ...config,
      };
    }
    if (this.options.divID) {
      this.selectedDiv = document.getElementById(this.options.divID);
      this.searchValue = "";
      this.searchResultsList = [];
    } else {
      console.error("ApiKey  divID not set correctly ");
    }
  }

  //initi fuctions
  init() {
    this.createSearchBox();
    this.setupCreateSearchTriggers();
    // this.createSkillSearchList([]);
    // this.SelectSkill();
    // this.funtional
  }
  createSearchBox() {
    const div = document.createElement("div");
    div.classList.add("input-group", "input-group-lg");
    div.style.display = "flex";
    div.style.flexDirection = "row";
    div.style.borderRadius = "30px";
    div.style.border = "1px solid #007DFC1A";

    const input = document.createElement("input");
    this.searchInputBox = input;
    input.id = "plugin-search-id";

    input.classList.add("form-control");

    input.setAttribute("aria-label", "Sizing example input");
    input.setAttribute(
      "placeholder",
      "Search Profile / Skill / Technology / Domain / Activity"
    );
    input.setAttribute("aria-describedby", "inputGroup-sizing-lg");
    input.style.fontSize = "1rem";
    input.style.height = "auto";
    input.style.borderRadius = "30px";
    input.style.border = "none";
    input.style.padding = "15px";
    input.type = "search";
    div.appendChild(input);

    // Format the search text to Title Case
    const searchText = "search"; // Replace with your desired text
    const formattedText =
      searchText.charAt(0).toUpperCase() + searchText.slice(1).toLowerCase();

    // Create the search button
    const button = document.createElement("button");
    button.style.padding = "0px 14px";
    button.style.borderRadius = "30px";
    button.style.margin = "6px";
    button.style.border = "none";
    button.style.background = "#007DFC";
    button.style.color = "white";

    button.innerHTML = `<i class="fas fa-search" style="margin-right: 8px;"></i> ${formattedText}`; // Add your icon HTML here
    button.setAttribute("aria-label", "Search");
    div.appendChild(button);
    this.selectedDiv.appendChild(div);
    const divDropDown = document.createElement("div");
    divDropDown.id = "dropdown-plugin-div";
    divDropDown.style.maxHeight = "270px";
    divDropDown.style.overflow = "auto";
    divDropDown.style.boxShadow = "0px 0px 12px 0px #0000000F";
    divDropDown.style.marginTop = "12px";
    // divDropDown.style.padding= "18px 12px 18px 12px"
    divDropDown.style.borderRadius = "12px";

    this.selectedDiv.appendChild(divDropDown);
  }
  setupCreateSearchTriggers() {
    const searchBoxElement = document.getElementById("plugin-search-id");
    searchBoxElement.addEventListener("input", (event) => {
      event.preventDefault();
      this.searchValue = searchBoxElement.value;
      this.searchAPI(this.searchValue);
    });
  }

  getSkillName(skillObject) {
    return skillObject.term;
  }
  skillClick(skillListId) {
    //add to selected skill to list
    // add json stringfly
    let arrayKey = JSON.stringify(this.searchResultsList[skillListId]);

    if (!this.selectedSkills.includes(arrayKey)) {
      this.selectedSkills.push(
        JSON.stringify(this.searchResultsList[skillListId])
      );
    }
    if (this.options.onSearchSkillClick) {
      this.options.onSearchSkillClick(this.searchResultsList[skillListId]);
    } else {
      console.info("You can use 'onSearchSkillClick' to capture the skill");
    }
    this.createSkillSearchList([]);
    if (this.options.selectedSkilldiv) {
      this.createSelectedSkillList();
    }
  }

  deleteSelectedSkill(skillListId) {
    this.selectedSkills.splice(skillListId, 1);
    this.createSelectedSkillList();
  }

  createSelectedSkillList() {
    const div = document.getElementById(this.options.selectedSkilldiv);
    div.innerHTML = "";

    const ul = document.createElement("ul");
    ul.classList.add("list-group");

    for (let i = 0; i < this.selectedSkills.length; i++) {
      let button = document.createElement("button");
      button.classList.add("btn-close");
      button.type = "button";
      button.setAttribute("aria-label", "Close");
      button.addEventListener("click", (event) => {
        this.deleteSelectedSkill(i);
      });
    }
    div.appendChild(ul);
  }

  createSkillSearchList(searchResultsList) {
    console.log(searchResultsList, "eeee list");
    const div = document.getElementById("dropdown-plugin-div");
    div.style.textAlign = "center";
    this.searchResultsList = searchResultsList;
    if (searchResultsList.length > 0) {
      const ul = document.createElement("ul");
      ul.style.padding = "30px";
      ul.classList.add("dropdown-menu");

      // create the list item elements and append them to the unordered list
      for (let i = 0; i < searchResultsList.length; i++) {
        const li = document.createElement("li");
        li.style.borderBottom = "1px solid #E0E0E0";
        li.addEventListener("click", (event) => {
          this.skillClick(i);
        });
        const a = document.createElement("a");
        a.classList.add("dropdown-item");
        a.href = "#";
        a.innerHTML = this.searchHighlight(
          this.searchValue,
          this.getSkillName(searchResultsList[i])
        );
        li.appendChild(a);
        ul.appendChild(li);
      }
      ul.style.display = "contents";
      ul.style.width = "100%";
      div.innerHTML = "";
      div.appendChild(ul);
    } else {
      div.innerHTML = "";
      // Create the first paragraph
      const paragraph1 = document.createElement("p");
      const icon1 = document.createElement("i");
      icon1.classList.add("far", "fa-frown"); // Assuming "fa-frown" is a thin sad, frown icon in Font Awesome
      icon1.style.padding = "0 10px";
      // Add the icon to the paragraph
      paragraph1.appendChild(icon1);

      // Add text to the first paragraph
      paragraph1.innerHTML += " No search results found!";
      paragraph1.style.fontSize = "16px";
      paragraph1.style.fontWeight = 500;
      paragraph1.style.color = "#828282";

      // Create the second paragraph
      const paragraph2 = document.createElement("p");
      paragraph2.innerHTML =
        "Click on the <strong>“Add skill icon”</strong> to add this new skill to your profile";
      div.innerHTML = "";
      // Append paragraphs to the main div
      div.appendChild(paragraph1);
      div.appendChild(paragraph2);

      // Create a button with an icon
      const button = document.createElement("button");
      button.innerHTML = '<i class="fas fa-plus"></i> Add Skill'; // Add your icon HTML here
      button.style.padding = "5px 15px";
      button.style.borderRadius = "5px";
      button.style.border = "1px solid #007DFC";
      button.style.background = "transparent";
      button.style.color = "#007DFC";

      // Append the button to the main div
      div.appendChild(button);
    }

    this.searchInputBox.classList.remove("loading");
    this.searchInputBox.type = "search";
  }

  searchHighlight(searched, text) {
    if (searched !== "") {
      let re = new RegExp(searched, "gi"); // add "i" flag for case-insensitivity
      let newText = text.replace(re, (match) => `<b>${match}</b>`);
      return newText;
    }
    return text;
  }

  searchAPI() {
    this.searchInputBox.classList.add("loading");
    this.searchInputBox.type = "text";
    if (this.searchValue.length > 1) {
      fetch(`${ENDPOINT_URL}ISOT/?q=${this.searchValue}&limit=10`)
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          if (this.searchValue == response.query) {
            this.createSkillSearchList(response.matches);
          }
        })
        .catch((err) => console.error(err));
    } else {
      this.createSkillSearchList([]);
    }
  }
}

class IysFunctionalAreasPlugin extends IysSearchPlugin {
  constructor(config) {
    super(config);
    this.options.skillPlayground = document.getElementById(
      this.options.skillPlayground
    );

    this.ratedSkillEvent = this.options.ratedSkillEvent;
    this.options.skilFunctionalAreaDiv = document.getElementById(
      this.options.skilFunctionalAreaDiv
    );
    this.options.skillSoftSkillsDiv = document.getElementById(
      this.options.skillSoftSkillsDiv
    );
    this.options.experienceProfilerAreaBox = document.getElementById(
      this.options.experienceProfilerAreaBox
    );
    this.fillStarImageUrl =
      "https://i.ibb.co/zxrDfTN/Screenshot-from-2023-04-29-09-48-17.png";
    this.emptyStarImageUrl =
      "https://i.ibb.co/XC1pj0h/Screenshot-from-2023-04-29-09-49-11.png";

    this.ratedSelectedSkills = [];
  }

  init() {
    if (isLoginUser) {
      let csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;

      let skillList = { skills: getListFromlocalStorage() };

      console.log("adding some saved slikks ");
      fetch(window.location.origin + "/add-skills/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(skillList),
      }).then((response) => {
        // Handle the response from the server
        if (response.ok) {
          // Successful response
          console.log("Skill added successfully!");

          clearlocalStorage();
        } else {
          // Handle errors
          console.error(
            "Failed to add skill:",
            response.status,
            response.statusText
          );
        }

        this.createListProfileSkills();
      });
    }

    this.createSearchBox();
    this.setupCreateSearchTriggers();
    this.createPlayground();
    // this.createAreaBox();
    // this.crea
    this.createRateSelectedSkills(this.options.skillPlayground);
    this.createListProfileSkills();
  }
  createPlayground() {
    this.selectedASkillBox = document.createElement("div");
    this.selectedASkillBox.classList.add("selected-skill-div");
    this.selectedASkillBox.id = "selected-skill-div";
    this.options.skillPlayground.appendChild(this.selectedASkillBox);
  }
  skillClick(skillListId) {
    clearsessionStorage(skillListId);
    this.createSkillSelectBox(this.searchResultsList[skillListId]);
    this.createSkillSearchList([]);
  }

  createSelectedSkillList(htmlElement) {
    const div = document.getElementById(this.options.selectedSkilldiv);
    div.innerHTML = "";

    const ul = document.createElement("ul");
    ul.classList.add("list-group");

    for (let i = 0; i < this.ratedSelectedSkills.length; i++) {
      let button = document.createElement("button");
      button.classList.add("btn-close");
      button.type = "button";
      button.setAttribute("aria-label", "Close");
      button.addEventListener("click", (event) => {
        this.deleteSelectedSkill(i);
      });

      let li = document.createElement("li");
      li.classList.add("list-group-item", "me-1");
      li.appendChild(button);

      let label = document.createElement("label");
      label.classList.add("form-check-label");
      label.textContent = this.getSkillName(this.ratedSelectedSkills[i]);

      li.appendChild(label);
      ul.appendChild(li);
    }
    div.appendChild(ul);

    htmlElement.appendChild(div);
  }

  SkillChildrenAPI(skillFileId) {
    fetch(window.location.origin + "/api-child/?id=" + skillFileId)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);

        this.createSkillSearchList(response);
      })
      .catch((err) => console.error(err));
  }

  createSkillButton(htmlElement, skillDetail, isFuncSkill) {
    // console.log("these are some chnages",skillDetail)
    var functionAreaDiv = document.getElementById("functional-area-button");
    var identifierData =
      isFuncSkill || skillDetail.child_count > 0 ? "div" : "button";
      
    var div = document.createElement(identifierData);

    if (isFuncSkill) {
      div.innerHTML =
        `<i class="fas fa-plus mr-1" style="color:#007DFC; padding-left:5px;"></i> ` +
        skillDetail.name;
    } else if (skillDetail.child_count > 0) {
      div.innerHTML =
        `<i class="fas fa-plus mr-1"  style="color:#007DFC;  padding:0px 10px;" ></i> ` +
        skillDetail.name;
    } else {
      div.textContent = skillDetail.name;
    }

    div.addEventListener("click", (event) => {
      console.log("these are some chnages", skillDetail);
      if (isFuncSkill) {
        console.log("if function");
        // clearsessionStorage();
        addTosessionStorage(skillDetail);

        this.funcSkillCard.classList.remove("active");
        this.softSkillCard.classList.remove("active");
        this.experienceProfileCard.classList.remove("active");
        this.createSkillSelectBox(skillDetail);
      } else if (skillDetail.child_count > 0) {
        console.log("elseif");
        addTosessionStorage(skillDetail);
        this.createSkillSelectBox(skillDetail);
      } else {
        console.log("else");
        this.changeRateModelElement(skillDetail);
      }
    });

    // div.setAttribute("type", "div");
    // div.setAttribute("class", "btn btn-secondary btn-rounded");
    div.setAttribute("data-mdb-toggle", "popover");
    div.setAttribute("data-mdb-content", "its mdb content");
    div.setAttribute("data-mdb-trigger", "hover");

    if (skillDetail.description) {
      div.addEventListener("mouseover", function () {
        const popover = new mdb.Popover(div, {
          container: "body",
          placement: "top",
          content: skillDetail.description,
          trigger: "hover",
        });

        popover.show();

        setTimeout(() => {
          popover.hide();
        }, 700);
      });
    }

    div.style.color = "#333333";
    div.style.background = (identifierData === "div" ? "rgba(0, 125, 252, 0.1)" : "white")
    div.style.borderRadius = "4px 4px 0px 0px";
    div.style.border = "0.5px solid #007DFC33";
    div.style.padding = "8px 12px 10px 12px";

    // add text rasfrom to buuton
    div.style.fontSize = "105%";
    div.style.marginLeft = "5px";
    div.style.marginTop = "15px";
    div.style.fontFamily =
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

    htmlElement.appendChild(div);
  }

  createSkillSearchButtonList(htmlElement, fuctionalAreasList, isFuncSkill) {
    htmlElement.innerHTML = "";

    if (fuctionalAreasList.length > 0) {
      if (isFuncSkill) {
        for (let i = 0; i < fuctionalAreasList.length; i++) {
          this.createSkillButton(
            htmlElement,
            fuctionalAreasList[i],
            isFuncSkill
          );
        }
      } else {
        let groupedTagsData = groupByTagsName(fuctionalAreasList);
        for (const tagTitle in groupedTagsData) {
          // htmlElement.innerHTML += tagTitleDiv;

          const items = groupedTagsData[tagTitle];
          for (const item of items) {
            this.createSkillButton(htmlElement, item, isFuncSkill);
          }
        }
      }
    }
  }

  saveTheSkillComment(commentValue, ratingValue, skillDetail) {
    let userRatedSkill = {
      skills: [
        {
          comment: commentValue,
          rating: ratingValue,
          file_id: skillDetail._id,
        },
      ],
    };

    if (isLoginUser) {
      let csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;
      fetch(window.location.origin + "/add-skills/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(userRatedSkill),
      })
        .then((response) => {
          // Handle the response from the server
          if (response.ok) {
            // Successful response
            console.log("Skill added successfully!");
          } else {
            // Handle errors
            console.error(
              "Failed to add skill:",
              response.status,
              response.statusText
            );
          }

          this.createListProfileSkills();
          document.getElementById("RateCloseButton").click();
          this.ratedSkillEvent(skillDetail);
        })
        .catch((error) => {
          // Handle network errors
          console.error("Error:", error);
        });
    } else {
      console.log("user not login adding skills");

      fetchData(`${ENDPOINT_URL}ISOT/details/?ids=${skillDetail._id}`, "GET")
        .then((response) => {
          addTolocalStorage({
            comment: commentValue,
            rating: ratingValue,
            isot_file_id: skillDetail._id,
            isot_file: response[0],
          });

          this.createListProfileSkills();
          document.getElementById("RateCloseButton").click();
          this.ratedSkillEvent(skillDetail);
        })
        .catch((err) => console.error(err));
    }
  }

  changeRateModelElement(skillDetail) {
    const RateSkillModel = document.getElementById("RateSkillModel");
    const RateSkillModelLabel = document.getElementById("RateSkillModelLabel");
    const spanElementForStar = document.getElementById("spanElementForStar");

    const rateSkillCommentBox = document.getElementById("rateSkillCommentBox");
    const spanElementForSaveButton = document.getElementById(
      "spanElementForSaveButton"
    );
    spanElementForSaveButton.innerHTML = "";
    // Create the button element
    var button = document.createElement("button");

    // Set the button attributes
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn btn-primary");
    button.setAttribute("id", "saveChangesButton");

    // Set the button content
    button.textContent = "Save changes";

    // Append the button to the document body or any desired parent element
    spanElementForSaveButton.appendChild(button);
    let titleText;

    if (skillDetail?.term) {
      titleText = skillDetail?.term;
      skillDetail = skillDetail.skills[0];
    } else {
      if (skillDetail) {
        titleText = skillDetail.name;
      }
    }

    rateSkillCommentBox.value = "";
    spanElementForStar.innerHTML = "";
    const modalEl = new mdb.Modal(RateSkillModel);
    RateSkillModelLabel.innerHTML = `Rate Skill <b class="text-primary"> ${titleText} </b>`;

    console.log("i am creating starts", skillDetail);
    this.createRatingElement(spanElementForStar, skillDetail);

    button.removeEventListener("click", this.saveTheSkillComment);

    button.addEventListener("click", (event) => {
      if (skillDetail.rating) {
        this.saveTheSkillComment(
          rateSkillCommentBox.value,
          skillDetail.rating.options.indexOf(
            spanElementForStar.noUiSlider.get()
          ) + 1,
          skillDetail
        );
      } else {
        alert("Please rate the skill");
      }
    });
    modalEl.show();
  }

  createSelectSkillsChildBox(htmlElement, skillList) {
    const outerDiv = document.createElement("div");
    if (skillList.length > 0) {
      outerDiv.classList.add("card");
      const innerDiv = document.createElement("div");
      innerDiv.classList.add("card");
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
      cardBody.style.padding = "10px 20px 20px 20px";
      // cardBody.textContent = "skill list";
      innerDiv.appendChild(cardBody);
      this.createSkillSearchButtonList(cardBody, skillList);

      outerDiv.appendChild(innerDiv);
    } else {
      outerDiv.innerHTML = "";
    }
    htmlElement.appendChild(outerDiv);
  }

  createSkillPath(htmlElement, skillList) {
    const ol = document.createElement("ol");
    ol.setAttribute("class", "breadcrumb");

    skillList.forEach((skill, index) => {
      const li = document.createElement("li");
      li.setAttribute("class", "breadcrumb-item");
      if (index === skillList.length - 1) {
        li.setAttribute("class", "breadcrumb-item active");
        li.setAttribute("aria-current", "page");
        li.textContent = skill.name;
      } else {
        li.addEventListener("click", (event) => {
          removeItemsFromSessionStorageAfterIndex(index);
          this.createSkillSelectBox(skill);
        });

        const link = document.createElement("a");
        link.setAttribute("href", `#`);
        link.textContent = skill.name;
        li.appendChild(link);
      }

      ol.appendChild(li);
    });

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "breadcrumb");
    nav.appendChild(ol);
    htmlElement.appendChild(nav);
  }

  createRatingElement(htmlElement, skillDetail) {
    // add exception for rating

    try {
      spanElementForStar.noUiSlider.destroy();
    } catch (error) {
      console.log("error in destroying slider", error);
    }

    let htmlElement1 = document.getElementById("spanElementForStar");
    if (skillDetail.rating) {
      let ratingOptions = skillDetail.rating.options;

      var arbitraryValuesForSlider = ratingOptions;

      var format = {
        to: function (value) {
          return arbitraryValuesForSlider[Math.round(value)];
        },
        from: function (value) {
          return arbitraryValuesForSlider.indexOf(value);
        },
      };

      noUiSlider.create(htmlElement1, {
        // start values are parsed by 'format'
        start: [ratingOptions[0]],
        range: { min: 0, max: arbitraryValuesForSlider.length - 1 },
        step: 1,
        tooltips: true,
        format: format,
        pips: { mode: "steps", format: format, density: 50 },
      });

      console.log("ratingOptions", ratingOptions, noUiSlider);
    }
    // check if rateType exist in rating object
    // if (rating[rateType] !== undefined) {
    //   var selectElement = document.createElement("select");
    //   selectElement.setAttribute("id", "glsr-ltr");
    //   selectElement.setAttribute("class", "star-rating");

    //   let listRatingLegends = rating[rateType];
    //   console.log("listRatingLegends", listRatingLegends);

    //   var options = [
    //     { value: "", text: "Select a Rating" },
    //     { value: "4", text: listRatingLegends[3] },
    //     { value: "3", text: listRatingLegends[2] },
    //     { value: "2", text: listRatingLegends[1] },
    //     { value: "1", text: listRatingLegends[0] },
    //   ];

    //   // Create and append option elements to select element
    //   for (var i = 0; i < options.length; i++) {
    //     var option = document.createElement("option");
    //     option.setAttribute("value", options[i].value);
    //     option.text = options[i].text;
    //     selectElement.appendChild(option);
    //   }

    //   htmlElement.appendChild(selectElement);
    // }
  }

  generateRatingStars(ratingNumber) {
    let stars = "<span>";

    for (let i = 0; i < ratingNumber; i++) {
      stars +=
        '<span style="font-size:120%" class="fa fa-star checkedstar"></span> ';
    }

    for (let i = ratingNumber; i < 4; i++) {
      stars += '<span style="font-size:120%" class="fa fa-star"></span> ';
    }

    return stars + "</span>";
  }

  createListProfileSkills() {
    if (isLoginUser) {
      fetchData(window.location.origin + "/get-skills/", "GET")
        .then((response) => {
          let skillList = response.data;

          this.selectedRateSkillDiv.innerHTML = "";

          this.rateNumber.innerHTML = skillList.length;

          // loop through the array of list item texts and create a list item for each
          for (let i = 0; i < skillList.length; i++) {
            let skill = skillList[i];

            let button = document.createElement("button");
            let ratePercentage =
              (skill.rating / skill.isot_file.rating.options.length) * 100;
            let messageIcon = "";
            if (skill.comment) {
              messageIcon = `<i class="fas fa-message" style="color:#3b71ca0;margin-left:10px;margin-right:10px"  ></i>`;
            } else {
              messageIcon = `<i class="far fa-message" style="color:#3b71ca0;margin-left:10px;margin-right:10px"  ></i>`;
            }

            button.innerHTML = `${skill.isot_file.name}  ${messageIcon}
            <div style="width: 25px; height: 25px; border-radius: 50%; background: radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2C58A0 ${ratePercentage}%, pink 0);">
            <progress value="${ratePercentage}" min="0" max="100" style="visibility:hidden;height:0;width:0;">75%</progress>
          </div>
   
           `;

            let iElement = document.createElement("i");
            iElement.classList.add("fas", "fa-xmark");
            iElement.style.color = "#a22525";
            iElement.style.marginLeft = "10px";
            iElement.style.fontSize = "170%";

            iElement.addEventListener("click", () => {
              console.log("delete the skill", skill);
              iElement.parentElement.remove();
              this.delete_skill(skill.id);
              console.log("refess the connect");
              this.createListProfileSkills();
            });
            button.appendChild(iElement);

            button.style.display = "inline-flex";
            button.style.alignItems = "center";

            // Number from 0.0 to 1.0
            button.setAttribute("type", "button");
            button.setAttribute("class", "btn btn-secondary btn-rounded");
            button.setAttribute("data-mdb-toggle", "popover");
            button.setAttribute(
              "data-mdb-content",
              "nknjdnfdfbhjvbhjfb ndn jhnndjfgdjhnfnh hjdghj"
            );
            button.setAttribute("data-mdb-trigger", "hover");

            button.style.border = "solid 2px #000000a6";
            button.style.color = "rgb(33, 36, 41)";
            button.style.background = "white";
            button.style.borderRadius = "10px";

            // add text rasfrom to buuton
            button.style.fontSize = "105%";
            button.style.textTransform = "capitalize";
            button.style.marginLeft = "5px";
            button.style.marginTop = "5px";
            button.style.fontFamily =
              'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

            button.addEventListener("mouseover", function () {
              const popoverContent = skill.comment;

              const popover = new mdb.Popover(button, {
                container: "body",
                placement: "top",
                content: popoverContent,
                trigger: "hover",
              });

              popover.show();

              setTimeout(() => {
                popover.hide();
              }, 700);
            });

            this.selectedRateSkillDiv.appendChild(button);
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the fetch request
          console.error(error);
        });
    } else {
      let skillList = getListFromlocalStorage();

      this.selectedRateSkillDiv.innerHTML = "";

      this.rateNumber.innerHTML = skillList.length;

      // loop through the array of list item texts and create a list item for each
      for (let i = 0; i < skillList.length; i++) {
        let skill = skillList[i];

        let button = document.createElement("button");
        let ratePercentage =
          (skill.rating / skill.isot_file.rating.options.length) * 100;
        console.log("ratePercentage", ratePercentage);
        button.innerHTML = `${skill.isot_file.name}  <i class="fas fa-message" style="color:#3b71ca0;margin-left:10px;margin-right:10px"  ></i>
            
            <div style="width: 25px; height: 25px; border-radius: 50%; background: radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#2C58A0 ${ratePercentage}%, pink 0);">
            <progress value="${ratePercentage}" min="0" max="100" style="visibility:hidden;height:0;width:0;">75%</progress>
          </div>
   `;

        var iElement = document.createElement("i");
        iElement.classList.add("fas", "fa-xmark");
        iElement.style.color = "#a22525";
        iElement.style.marginLeft = "10px";
        iElement.style.fontSize = "170%";

        iElement.addEventListener("click", () => {
          iElement.parentElement.remove();
          console.log("delted the skill", skill, skill.isot_file_id);
          this.delete_skill(skill.isot_file_id);
          console.log("refess the connect");
          // this.createListProfileSkills();
        });
        button.appendChild(iElement);

        button.style.display = "inline-flex";
        button.style.alignItems = "center";

        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-secondary btn-rounded");
        button.setAttribute("data-mdb-toggle", "popover");
        button.setAttribute(
          "data-mdb-content",
          "nknjdnfdfbhjvbhjfb ndn jhnndjfgdjhnfnh hjdghj"
        );
        button.setAttribute("data-mdb-trigger", "hover");

        button.style.border = "solid 2px #000000a6";
        button.style.color = "rgb(33, 36, 41)";
        button.style.background = "white";
        button.style.borderRadius = "10px";

        // add text rasfrom to buuton
        button.style.fontSize = "105%";
        button.style.textTransform = "capitalize";
        button.style.marginLeft = "5px";
        button.style.marginTop = "5px";
        button.style.fontFamily =
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

        button.addEventListener("mouseover", function () {
          const popoverContent = skill.comment;

          const popover = new mdb.Popover(button, {
            container: "body",
            placement: "top",
            content: popoverContent,
            trigger: "hover",
          });

          popover.show();

          setTimeout(() => {
            popover.hide();
          }, 700);
        });

        this.selectedRateSkillDiv.appendChild(button);
      }
    }
  }

  createRateSelectedSkills(htmlElement) {
    const div = document.createElement("div");
    div.classList.add("mt-3");

    // Create the outer div element with the class "accordion"
    var accordionDiv = document.createElement("div");
    accordionDiv.classList.add("accordion");
    accordionDiv.id = "ratedskill";

    // Create the inner div element with the class "accordion-item"
    var accordionItemDiv = document.createElement("div");
    accordionItemDiv.classList.add("accordion-item");

    // Create the h2 element with the class "accordion-header" and id "headingOne"
    var accordionHeader = document.createElement("h2");
    accordionHeader.classList.add("accordion-header");
    accordionHeader.id = "ratedskillheading";

    // Create the button element with the class "accordion-button" and attributes
    var accordionTitle = document.createElement("h1");
    accordionTitle.style.fontSize = "1.5rem";
    accordionTitle.classList.add("accordion-button");
    accordionTitle.classList.add("text-dark");

    accordionTitle.type = "button";
    accordionTitle.id = "rate-skill-button";
    accordionTitle.dataset.mdbToggle = "collapse";
    accordionTitle.dataset.mdbTarget = "#collapsetwo";
    accordionTitle.setAttribute("aria-expanded", "false");
    accordionTitle.setAttribute("aria-controls", "collapsetwo");

    // create a span elment with some id in it
    var rateNumber = document.createElement("span");
    rateNumber.id = "rate-skill-span";
    rateNumber.classList.add("text-danger");
    rateNumber.style.marginLeft = "0.5rem";
    rateNumber.style.marginRight = "0.5rem";
    this.rateNumber = rateNumber;
    rateNumber.innerText = this.ratedSelectedSkills.length;

    let saveProfileBtn = document.createElement("span");
    saveProfileBtn.className = "badge rounded-pill badge-primary mr-3";
    saveProfileBtn.style.marginRight = "50px";
    saveProfileBtn.style.top = "10px";
    saveProfileBtn.style.right = "0";
    saveProfileBtn.style.cursor = "pointer";

    // add event listner to save profile button
    saveProfileBtn.addEventListener("click", () => {
      console.log("save profile button clicked");
      window.location.href = "/save-profile/";
    });
    saveProfileBtn.style.position = "absolute";
    saveProfileBtn.textContent = "Save Profile";

    accordionTitle.innerText = "Your Profile Skills has ";
    accordionTitle.appendChild(rateNumber);

    // create a span node with "Skills" text in it
    var spanElement2 = document.createElement("span");
    spanElement2.innerText = " Skills";
    accordionTitle.appendChild(spanElement2);
    accordionTitle.appendChild(saveProfileBtn);

    // accordionTitle.innerText =  accordionTitle.innerText+ " Skills";

    // Append the button to the h2 element
    accordionHeader.appendChild(accordionTitle);

    // Create the inner div element with the id "collapsetwo" and class "accordion-collapse collapse show"
    var accordionCollapseDiv = document.createElement("div");
    accordionCollapseDiv.id = "collapsetwo";
    accordionCollapseDiv.classList.add("accordion-collapse", "collapse");
    accordionCollapseDiv.setAttribute("aria-labelledby", "headingOne");
    accordionCollapseDiv.setAttribute("data-mdb-parent", "#ratedskill");

    // Create the inner div element with the class "accordion-body"
    var accordionBodyDiv = document.createElement("div");
    accordionBodyDiv.classList.add("accordion-body");

    // Append the inner div to the outer div
    accordionCollapseDiv.appendChild(accordionBodyDiv);

    const cardDiv = document.createElement("div");

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.classList.add("card-body");

    this.selectedRateSkillDiv = cardBodyDiv;

    const cardText = document.createElement("p");
    cardText.classList.add("card-text");
    cardBodyDiv.appendChild(cardText);

    cardDiv.appendChild(cardBodyDiv);

    accordionBodyDiv.appendChild(cardDiv);

    // Append the h2 and inner div to the accordion item div
    accordionItemDiv.appendChild(accordionHeader);
    accordionItemDiv.appendChild(accordionCollapseDiv);

    // Append the accordion item div to the accordion div
    accordionDiv.appendChild(accordionItemDiv);

    // append the card element to the document body

    div.appendChild(accordionDiv);

    htmlElement.appendChild(div);
  }

  createSkillSelectBox(skillDetail) {
    console.log("createSkillSelectBox --------- ", skillDetail);
    this.selectedASkillBox.innerHTML = "";
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.classList.add("card-body");

    const cardTitleH4 = document.createElement("h4");
    cardTitleH4.classList.add("card-title");

    const rateButton = document.createElement("button");
    rateButton.classList.add(
      "btn",
      "btn-secondary",
      "float-end",
      "btn-rounded"
    );
    rateButton.setAttribute("type", "button");
    rateButton.style.fontWeight = "bolder";
    rateButton.style.fontSize = "14px";

    rateButton.textContent = "Rate";
    rateButton.addEventListener("click", () => {
      console.log("rate button clicked", skillDetail);
      this.changeRateModelElement(skillDetail);
    });
    rateButton.innerHTML += `  <i class="fas fa-star"></i>`;

    this.cardBodyDiv = cardBodyDiv;

    if (skillDetail?.term) {
      console.log("added", skillDetail.skills[0]);
      addTosessionStorage(skillDetail.skills[0]);
      cardTitleH4.innerHTML = `Selected Skill  <b  class="text-primary">"${skillDetail.term}"</b>`;
    } else {
      if (skillDetail) {
        cardTitleH4.innerHTML = `Selected Skill <b class="text-primary">"${skillDetail.name}"</b>`;
      }
    }

    // cardTitleH4.appendChild(titleText);

    if (skillDetail.rating_type > 0) {
      cardTitleH4.appendChild(rateButton);
    } else if (
      skillDetail?.skills?.length > 0 &&
      skillDetail?.skills[0].rating_type > 0
    ) {
      cardTitleH4.appendChild(rateButton);
    }

    const hrElement = document.createElement("hr");

    cardBodyDiv.appendChild(cardTitleH4);
    cardBodyDiv.appendChild(hrElement);

    this.createSkillPath(cardBodyDiv, getListFromsessionStorage());

    if (skillDetail?.skills?.length > 0) {
      skillDetail.skills.forEach((skill) => {
        // clearsessionStorage();
        this.treeSkillAPI(cardBodyDiv, skill._id);
        // this.createSkillPath(cardBodyDiv, getListFromsessionStorage());
      });
    } else {
      this.childrenSkillAPI(skillDetail._id);
    }

    cardDiv.appendChild(cardBodyDiv);
    this.selectedASkillBox.appendChild(cardDiv);
  }

  createAreaBox() {
    // Create the tab navigation ul element
    const tabNavUl = document.createElement("ul");
    tabNavUl.classList.add("nav", "nav-tabs", "nav-fill", "mb-3");
    tabNavUl.id = "ex1";
    tabNavUl.setAttribute("role", "tablist");

    // Create the tab navigation li elements
    const tabNavLi1 = document.createElement("li");
    tabNavLi1.classList.add("nav-item");
    tabNavLi1.setAttribute("role", "presentation");

    const tabNavLi2 = document.createElement("li");
    tabNavLi2.classList.add("nav-item");
    tabNavLi2.setAttribute("role", "presentation");

    const tabNavLi3 = document.createElement("li");
    tabNavLi3.classList.add("nav-item");
    tabNavLi3.setAttribute("role", "presentation");

    // Create the tab navigation link elements
    const tabNavLink1 = document.createElement("a");
    tabNavLink1.classList.add("nav-link", "fw-bold");
    tabNavLink1.id = "ex2-tab-1";
    tabNavLink1.setAttribute("data-mdb-toggle", "tab");
    tabNavLink1.href = "#ex2-tabs-1";
    tabNavLink1.setAttribute("role", "tab");
    tabNavLink1.setAttribute("aria-controls", "ex2-tabs-1");
    tabNavLink1.setAttribute("aria-selected", "true");
    tabNavLink1.textContent = " Functional Areas";
    tabNavLink1.style.fontSize = "130%";

    const tabNavLink2 = document.createElement("a");
    tabNavLink2.classList.add("nav-link", "fw-bold");
    tabNavLink2.id = "ex2-tab-2";
    tabNavLink2.setAttribute("data-mdb-toggle", "tab");
    tabNavLink2.href = "#ex2-tabs-2";
    tabNavLink2.setAttribute("role", "tab");
    tabNavLink2.setAttribute("aria-controls", "ex2-tabs-2");
    tabNavLink2.setAttribute("aria-selected", "false");
    tabNavLink2.textContent = "Soft Skills";
    tabNavLink2.style.fontSize = "130%";

    const tabNavLink3 = document.createElement("a");
    tabNavLink3.classList.add("nav-link", "fw-bold");
    tabNavLink3.id = "ex2-tab-3";
    tabNavLink3.setAttribute("data-mdb-toggle", "tab");
    tabNavLink3.href = "#ex2-tabs-3";
    tabNavLink3.setAttribute("role", "tab");
    tabNavLink3.setAttribute("aria-controls", "ex2-tabs-3");
    tabNavLink3.setAttribute("aria-selected", "false");
    tabNavLink3.textContent = "Experience Profile";
    tabNavLink3.style.fontSize = "130%";

    // Append the tab navigation links to the respective list items
    tabNavLi1.appendChild(tabNavLink1);
    tabNavLi2.appendChild(tabNavLink2);
    tabNavLi3.appendChild(tabNavLink3);

    // Append the list items to the tab navigation ul element
    tabNavUl.appendChild(tabNavLi1);
    tabNavUl.appendChild(tabNavLi2);
    tabNavUl.appendChild(tabNavLi3);

    // Create the tab content div element
    const tabContentDiv = document.createElement("div");
    tabContentDiv.classList.add("tab-content");
    tabContentDiv.id = "ex2-content";

    // Create the tab content div elements
    const tabContentDiv1 = document.createElement("div");
    tabContentDiv1.classList.add("tab-pane", "fade");
    tabContentDiv1.id = "ex2-tabs-1";
    tabContentDiv1.setAttribute("role", "tabpanel");
    tabContentDiv1.setAttribute("aria-labelledby", "ex2-tab-1");
    tabContentDiv1.innerHTML = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
    this.funcSkillCard = tabContentDiv1;

    const tabContentDiv2 = document.createElement("div");
    tabContentDiv2.classList.add("tab-pane", "fade");
    tabContentDiv2.id = "ex2-tabs-2";
    tabContentDiv2.setAttribute("role", "tabpanel");
    tabContentDiv2.setAttribute("aria-labelledby", "ex2-tab-2");
    tabContentDiv2.innerHTML = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
    this.softSkillCard = tabContentDiv2;

    const tabContentDiv3 = document.createElement("div");
    tabContentDiv3.classList.add("tab-pane", "fade");
    tabContentDiv3.id = "ex2-tabs-3";
    tabContentDiv3.setAttribute("role", "tabpanel");
    tabContentDiv3.setAttribute("aria-labelledby", "ex2-tab-3");
    tabContentDiv3.innerHTML = `<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;
    this.experienceProfileCard = tabContentDiv3;

    // Append the tab content div elements to the tab content div
    tabContentDiv.appendChild(tabContentDiv1);
    tabContentDiv.appendChild(tabContentDiv2);
    tabContentDiv.appendChild(tabContentDiv3);

    this.options.skilFunctionalAreaDiv.appendChild(tabNavUl);
    this.options.skilFunctionalAreaDiv.appendChild(tabContentDiv);
  }

  functionalAreaAPI() {
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-popular-categories/";
    } else {
      url = `${ENDPOINT_URL}ISOT/popular-categories/`;
    }

    fetch(url)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.log(response);

        this.createSkillSearchButtonList(this.funcSkillCard, response, true);
      })
      .catch((err) => console.error(err));
  }

  softLanguageProficiencySkillAPI() {
    let skillId = "files/a54b2fe8-dfce-4ff8-977d-af63d7777e89";
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-child/?id=" + skillId;
    } else {
      url = `${ENDPOINT_URL}ISOT/children/?id=${skillId}`;
    }
    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.warn("children", response, this.softSkillCard);
        this.createSkillSearchButtonList(this.softSkillCard, response, true);

        // this.createSelectSkillsChildBox(this.cardBodyDiv, response);
      })
      .catch((err) => console.error(err));
  }

  ExperienceProfileAPI() {
    let skillId = "files/fe2f048a-aa8c-4e16-9f51-378a18a2b17a";
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-child/?id=" + skillId;
    } else {
      url = `${ENDPOINT_URL}ISOT/children/?id=${skillId}`;
    }
    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        this.createSkillSearchButtonList(
          this.experienceProfileCard,
          response,
          true
        );

        // this.createSelectSkillsChildBox(this.cardBodyDiv, response);
      })
      .catch((err) => console.error(err));
  }

  childrenSkillAPI(skillId) {
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-child/?id=" + skillId;
    } else {
      url = `${ENDPOINT_URL}ISOT/children/?id=${skillId}`;
    }
    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.log("children", response);
        this.createSelectSkillsChildBox(this.cardBodyDiv, response);
      })
      .catch((err) => console.error(err));
  }

  delete_skill(skill_id) {
    if (isLoginUser) {
      console.log("skill_id", skill_id);

      let csrftoken = document.querySelector(
        "[name=csrfmiddlewaretoken]"
      ).value;
      console.log("delete_skill", skill_id);
      // delete-skill/<str:skill_id>/

      // create post resquest to delete skill
      let url = window.location.origin + "/delete-skill/" + skill_id + "/";
      console.log("delete_skill", url);
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          console.log("delete_skill", response);

        })
        .catch((err) => console.error(err));
    } else {
      console.log("delete_skill", skill_id);
      removeItemFromlocalStorage(skill_id);
      console.log("deleted_skill");

    }
  }

  treeSkillAPI(cardBodyDiv, skillId) {
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-tree/?id=" + skillId;
    } else {
      url = `${ENDPOINT_URL}ISOT/tree/?id=${skillId}`;
    }

    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "/limit-exceeded/";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        this.createSkillPath(cardBodyDiv, response.ancestors);
        if (response.siblings.length > 0) {
          this.createSelectSkillsChildBox(this.cardBodyDiv, response.siblings);
        } else {
          this.childrenSkillAPI(skillId);
        }
      })
      .catch((err) => console.error(err));
  }
}
