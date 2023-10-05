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

function findObjectByIsotFileId(array, isotFileId) {
  // Iterate through each object in the array
  for (const obj of array) {
      // Check if the RatedSkils array exists in the object
      if (obj.RatedSkills) {
          // Use the find method to search for the object with the specified isot_file_id
          const foundObject = obj.RatedSkills.find(skill => skill.isot_file_id === isotFileId);
          
          // If found, return the object
          if (foundObject) {
              return foundObject;
          }
      }
  }

  // If no match is found, return null or handle as needed
  return null;
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

// Helper function to create a button with an icon
function createButton(text, iconClass, align, margin, disabled, onClick) {
  const button = document.createElement("button");
  button.innerHTML = `<i class="${iconClass}"></i> ${text}`;
  button.style.padding = "5px 15px";
  button.style.borderRadius = "5px";
  button.style.border = disabled ? "" : "1px solid #007DFC";
  button.style.background = "transparent";
  button.style.color = disabled ? "" : "#007DFC";
  button.style.float = align;
  button.style.marginRight = margin;
  button.disabled = disabled;
  if (!disabled) {
    button.addEventListener("click", onClick);
  }

  return button;
}

// Function to handle API calling for  "Add Skill" button click
function addSkillToApi(payload) {
  // API endpoint (replace with your actual API endpoint)
  const apiEndpoint = "https://your-api-endpoint.com/addSkill";

  // Make the API call using the fetch API
  return fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any additional headers if needed
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle the API response data as needed
      console.log("API response:", data);
      return data; // You can return the data if needed
    })
    .catch((error) => {
      console.error("API error:", error);
      throw error; // You can throw the error for further handling
    });
}

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

    // Create the clear icon
    const clearIcon = document.createElement("span");
    clearIcon.innerHTML = "&times;";
    clearIcon.style.position = "absolute";
    clearIcon.style.right = "10px";
    clearIcon.style.top = "50%";
    clearIcon.style.transform = "translateY(-50%)";
    clearIcon.style.cursor = "pointer";
    clearIcon.style.color = "rgb(255 0 0)";
    clearIcon.style.fontSize = "25px";
    clearIcon.style.display = "none"; // Initially hide the clear icon

    // Create a container for the input and clear icon
    const inputContainer = document.createElement("div");
    inputContainer.style.position = "relative";
    inputContainer.style.flex = "1"; // Take up remaining space in the flex container
    div.appendChild(inputContainer);

    // Append the input and clear icon to the container
    inputContainer.appendChild(input);
    inputContainer.appendChild(clearIcon);

    // Add click event to clear the input field
    clearIcon.addEventListener("click", () => {
      input.value = "";
      divDropDown.style.display = "none";
      this.selectedASkillBox.style.display = "none";
      clearIcon.style.display = "none"; // Hide the clear icon after clearing input
    });

    // Append the clear icon to the search box div
    div.appendChild(clearIcon);

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

    // Add click event to trigger the searchAPI method
    button.addEventListener("click", () => {
      this.searchAPI();
    });

    div.appendChild(button);

    // Event listener to toggle search button and clear icon based on input content
    input.addEventListener("input", () => {
      const hasInput = input.value.trim() !== "";
      clearIcon.style.display = hasInput ? "block" : "none";
      button.style.display = hasInput ? "none" : "block";
      divDropDown.style.display = hasInput ? "block" : "none";
      this.selectedASkillBox.style.display = hasInput ? "none" : "block";
    });

    // Initial check to hide search button if the input has content
    if (input.value.trim() !== "") {
      clearIcon.style.display = "block";
      button.style.display = "none";
      divDropDown.style.display = "none";
      this.selectedASkillBox.style.display = "none";
    }

    this.selectedDiv.appendChild(div);
    const divDropDown = document.createElement("div");
    divDropDown.id = "dropdown-plugin-div";
    divDropDown.style.maxHeight = "270px";
    divDropDown.style.overflow = "auto";
    divDropDown.style.boxShadow = "0px 0px 12px 0px #0000000F";
    divDropDown.style.marginTop = "12px";
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

  createSkillSearchList(searchResultsList, searchText) {
    const div = document.getElementById("dropdown-plugin-div");

    div.style.textAlign = "center";
    div.style.padding = "30px";
    div.style.marginBottom = "30px";
    this.searchResultsList = searchResultsList;
    if (searchResultsList.length > 0) {
      const ul = document.createElement("ul");
      // Create buttons after the unordered list

      ul.style.padding = "30px";
      ul.classList.add("dropdown-menu");

      // create the list item elements and append them to the unordered list
      for (let i = 0; i < searchResultsList.length; i++) {
        const li = document.createElement("li");
        li.style.borderBottom = "1px solid #E0E0E0";
        li.addEventListener("click", (event) => {
          this.skillClick(i);
          div.style.display = "none";
          this.selectedASkillBox.style.display = "block";

          // remove local storages
          // clearlocalStorage();
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
        // Append buttons to the main div
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
      icon1.classList.add("far", "fa-frown"); //  frown icon in Font Awesome
      icon1.style.padding = "0 10px";
      paragraph1.appendChild(icon1);
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

      // Add event listener to the button
      button.addEventListener("click", () => {
        this.openAddSkillModal(searchText);
      });

      // Append the button to the main div
      div.appendChild(button);
    }
  }

  // Function to open the Add Skill modal with two inputs and labels
  openAddSkillModal(searchText) {
    const modalDiv = document.createElement("div");
    modalDiv.classList.add("modal", "fade", "show");
    modalDiv.style.display = "flex";
    modalDiv.style.alignItems = "center";
    modalDiv.style.justifyContent = "center";
    modalDiv.style.position = "fixed";
    modalDiv.style.top = "0";
    modalDiv.style.left = "0";
    modalDiv.style.width = "100%";
    modalDiv.style.height = "100%";
    modalDiv.style.overflow = "auto";
    modalDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Light black overlay
    modalDiv.style.zIndex = "1000";

    // Create the modal content
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");
    modalContent.style.width = "40%"; // Set modal width to 40%
    modalContent.style.background = "#fff";
    modalContent.style.padding = "20px";
    modalDiv.appendChild(modalContent);

    // Create a container for label and close button
    const headerContainer = document.createElement("div");
    headerContainer.style.display = "flex";
    headerContainer.style.justifyContent = "space-between";
    headerContainer.style.alignItems = "center";
    modalContent.appendChild(headerContainer);

    // Add label
    const label = document.createElement("div");
    label.textContent = "Add New Element";
    label.style.fontSize = "18px";
    label.style.fontWeight = 600;
    headerContainer.appendChild(label);

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;"; // Using the "times" symbol (X) for the close button
    closeButton.style.fontSize = "20px";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", () => {
      modalDiv.style.display = "none";
    });
    headerContainer.appendChild(closeButton);

    // Add horizontal line
    const hr = document.createElement("hr");
    hr.style.marginTop = "5px";
    hr.style.marginBottom = "15px";
    modalContent.appendChild(hr);

    // Create the first input field with label
    const inputLabel1 = document.createElement("label");
    inputLabel1.innerHTML = 'Element<span style="color:red">*</span>';
    inputLabel1.style.fontWeight = 500;

    modalContent.appendChild(inputLabel1);

    const inputField1Container = document.createElement("div");
    inputField1Container.style.position = "relative";
    inputField1Container.style.border = "1px solid #E6E6E6";
    inputField1Container.style.borderRadius = "4px";
    inputField1Container.style.marginBottom = "10px";
    modalContent.appendChild(inputField1Container);

    const inputField1 = document.createElement("input");
    inputField1.type = "text";
    inputField1.value = searchText;
    inputField1.placeholder = "Enter your  name";
    inputField1.style.width = "calc(100% - 24px)";
    inputField1.style.border = "none";
    inputField1.style.padding = "13px 16px 13px 16px";
    inputField1.addEventListener("input", () => {
      // Show or hide the clear icon based on input content
      clearIcon.style.display = inputField1.value ? "block" : "none";
    });
    inputField1Container.appendChild(inputField1);

    // Add cross icon to clear input field
    const clearIcon = document.createElement("span");
    clearIcon.innerHTML = "&times;";
    clearIcon.style.position = "absolute";
    clearIcon.style.right = "10px";
    clearIcon.style.top = "5px";
    clearIcon.style.cursor = "pointer";
    clearIcon.style.color = "rgb(255 0 0)";
    clearIcon.style.fontSize = "25px";

    clearIcon.addEventListener("click", () => {
      inputField1.value = "";
      clearIcon.style.display = "none"; // Hide the clear icon after clearing input
    });
    inputField1Container.appendChild(clearIcon);

    // Create the container for dropdown (input field2)
    const inputContainer2 = createInputContainer(
      'Category<span style="color:red">*</span>'
    );

    // Create the dropdown (select element)
    const dropdown = createDropdown();
    inputContainer2.appendChild(dropdown);

    // Create a button inside the modal
    const modalButton = document.createElement("button");
    modalButton.innerHTML = "Add";
    modalButton.style.width = "fit-content";
    modalButton.style.padding = "5px 15px";
    modalButton.style.borderRadius = "5px";
    modalButton.style.border = "1px solid #007DFC";
    modalButton.style.background = "#007DFC";
    modalButton.style.color = "#fff";
    modalButton.style.cursor = "pointer";
    modalButton.style.alignSelf = "flex-end";
    modalButton.addEventListener("click", () => {
      // Get the values from inputField1 and dropdownButton
      const skillName = inputField1.value;
      const selectedCategory = dropdown.value;

      // Check if skillName is not empty
      if (skillName.trim() === "") {
        alert("Please enter a skill name");
        return;
      }

      // Check if a category is selected (replace "Select an option" with your default text)
      if (selectedCategory === "Select an option") {
        alert("Please select a category");
        return;
      }

      // Call the API function with the payload
      addSkillToApi({ skillName, selectedCategory })
        .then((data) => {
          // Optionally, you can close the modal or perform other actions
          modalDiv.style.display = "none";
        })
        .catch((error) => {
          // Handle errors, show an alert, or perform other actions
        });
    });

    modalContent.appendChild(modalButton);

    // Append the modal to the document body
    document.body.appendChild(modalDiv);

    function createInputContainer(labelText) {
      const container = document.createElement("div");
      container.style.position = "relative";
      modalContent.appendChild(container);

      const label = document.createElement("label");
      label.style.fontWeight = 500;
      label.innerHTML = labelText;
      container.appendChild(label);

      return container;
    }

    // Helper function to create the dropdown (select element)
    function createDropdown() {
      const dropdown = document.createElement("select");
      dropdown.defaultSelected = "option2";
      dropdown.style.width = "100%";
      dropdown.style.padding = "13px 16px 13px 20px";
      dropdown.style.border = "1px solid #E6E6E6";
      dropdown.style.borderRadius = "4px";
      dropdown.style.marginBottom = "10px";
      dropdown.style.background = "white";

      // Add options to the dropdown (you can customize this part based on your data)
      const option1 = document.createElement("option");
      option1.value = "option1";
      option1.text = "Option 1";
      dropdown.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = "option2";
      option2.text = "Option 2";
      dropdown.appendChild(option2);

      // ... add more options ...

      return dropdown;
    }
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
    // this.searchInputBox.classList.add("loading");
    this.searchInputBox.type = "text";

    const div = document.getElementById("dropdown-plugin-div");
    div.style.padding = "30px";

    // Create and append the loader while waiting for the API response

    const loader = document.createElement("div");
    loader.className = "loader";

    div.innerHTML = ""; // Clear previous content
    div.appendChild(loader);

    if (this.searchValue.length > 0) {
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
            this.createSkillSearchList(response.matches, this.searchValue);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => {
          // Remove the loader when the API call is complete
          // div.removeChild(loader);
        });
    } else {
      this.createSkillSearchList([], this.searchValue);
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

  /**
   * creating accordion **/

  createSkillButton(
    htmlElement,
    skillDetail,
    isFuncSkill,
    identifier,
    uniqueIdentifier
  ) {
    var parentDiv = document.createElement("div");
    parentDiv.style.width = "100%";
    parentDiv.style.textAlign = "left";
    parentDiv.setAttribute("class", "accordion accordion-false");
    parentDiv.setAttribute("id", "parent-" + skillDetail._id);

    var childDiv = document.createElement("div");
    
    childDiv.setAttribute("id", "child-" + skillDetail._id);
    childDiv.style.display="flex";

    // let getUserSelectedSkills = getListFromlocalStorage();
    // let getSingleSelectSkill = getUserSelectedSkills.find((element) => element.tags_data._id === uniqueIdentifier)
    // console.log(getSingleSelectSkill,"getSingleSelectSkill")

    // if(getSingleSelectSkill?.length > 0){
    //  const returndede =  getUserSelectedSkills.find((element) => element.isot_file._id === skillDetail._id)
    //   console.log(returndede,"returndede")
    // }
    // console.log(getSingleSelectSkill,"getUserSelectedSkills",getUserSelectedSkills)
    if (identifier === "accordionChild") {
      htmlElement.innerHTML = "";
      var skilldetailKey = document.getElementById(uniqueIdentifier);
      
      var panelDiv = document.createElement("button");
      panelDiv.setAttribute("class", skillDetail._id);
      panelDiv.style.border = "1px solid grey";
      panelDiv.style.borderRadius = "30px";
      panelDiv.style.margin = "5px";
      panelDiv.style.padding = "5px";
      panelDiv.style.background = "white";
      const userSkillDetail = this.sortRatingByLocalStorage();
      const foundObject = findObjectByIsotFileId(userSkillDetail, skillDetail._id);

if (foundObject) {
  panelDiv.innerHTML = `${skillDetail.name} <i class="fa fa-check" style="color:green"></i>`;
} else {
  panelDiv.innerHTML = skillDetail.name;
}

      panelDiv.addEventListener("click", () => {
        this.changeRateModelElement(skillDetail, uniqueIdentifier);
      });

      skilldetailKey.appendChild(panelDiv);
    } else {
      if (isFuncSkill) {
        parentDiv.innerHTML =
          `<i class="fas fa-plus mr-1"  style="color:#007DFC; padding-left:5px;"></i> ` +
          skillDetail.name;
      } else if (skillDetail.child_count > 0) {
        parentDiv.innerHTML =
          `<i class="fas fa-plus mr-1"  style="color:#007DFC;  padding:0px 10px;" ></i> ` +
          skillDetail.name;
      } else {
        parentDiv.textContent = skillDetail.name;
      }

      parentDiv.addEventListener("click", (event) => {
        if (isFuncSkill) {
          console.log("if function");
          // clearsessionStorage();
          addTosessionStorage(skillDetail);

          this.funcSkillCard.classList.remove("active");
          this.softSkillCard.classList.remove("active");
          this.experienceProfileCard.classList.remove("active");
          this.createSkillSelectBox(skillDetail);
        } else if (skillDetail.child_count > 0) {
          addTosessionStorage(skillDetail);

          //this.createSkillSelectBox(skillDetail,"accordionChild");
          const isExpanded =
            parentDiv.getAttribute("class") === "accordion-false";

          // Toggle the value of aria-expanded
          parentDiv.setAttribute(
            "class",
            String(`accordion accordion-${!isExpanded}`)
          );
          this.childrenSkillAPI(skillDetail._id, "accordionChild");
        } else {
          this.changeRateModelElement(skillDetail);
        }
      });

      parentDiv.setAttribute("data-mdb-toggle", "popover");
      parentDiv.setAttribute("data-mdb-content", "its mdb content");
      parentDiv.setAttribute("data-mdb-trigger", "hover");

      if (skillDetail.description) {
        parentDiv.addEventListener("mouseover", function () {
          const popover = new mdb.Popover(parentDiv, {
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

      parentDiv.style.color = "#333333";
      parentDiv.style.background =
        isFuncSkill || skillDetail.child_count > 0
          ? "rgba(0, 125, 252, 0.1)"
          : "white";
      parentDiv.style.borderRadius = "4px 4px 0px 0px";
      parentDiv.style.border = "0.5px solid #007DFC33";
      parentDiv.style.padding = "8px 12px 10px 12px";
      parentDiv.style.fontSize = "105%";

      parentDiv.appendChild(childDiv);
      htmlElement.appendChild(parentDiv);

      var skillDetailChild = document.createElement("div");
      skillDetailChild.style.padding = "10px";
      skillDetailChild.classList.add("panel");
      skillDetailChild.style.justifyContent = "space-around";
      skillDetailChild.style.display = "flex";
      skillDetailChild.style.flexWrap = "wrap";
      skillDetailChild.setAttribute("id", skillDetail._id);
      

      parentDiv.after(skillDetailChild);
    }
  }

  createSkillSearchButtonList(
    htmlElement,
    fuctionalAreasList,
    isFuncSkill,
    identifier,
    skillId
  ) {
    console.log("listing", htmlElement, fuctionalAreasList);
    htmlElement.innerHTML = "";

    if (fuctionalAreasList.length > 0) {
      if (isFuncSkill) {
        for (let i = 0; i < fuctionalAreasList.length; i++) {
          this.createSkillButton(
            htmlElement,
            fuctionalAreasList[i],
            isFuncSkill,
            identifier,
            skillId
          );
        }
      } else {
        let groupedTagsData = groupByTagsName(fuctionalAreasList);
        for (const tagTitle in groupedTagsData) {
          // htmlElement.innerHTML += tagTitleDiv;

          const items = groupedTagsData[tagTitle];
          for (const item of items) {
            this.createSkillButton(
              htmlElement,
              item,
              isFuncSkill,
              identifier,
              skillId
            );
          }
        }
      }
    }
  }
  
  sortRatingByLocalStorage() {
    
    const inputArray = getListFromlocalStorage();
    let output = {};

    inputArray.forEach((item) => {
      const parentID = item.parentSkillDetailId;
      if (!output[parentID]) {
        output[parentID] = {
          parentID,
          RatedSkills: [],
        };
      }

      const ratedSkill = {
        comment: item.comment,
        rating: item.rating,
        isot_file_id: item.isot_file_id,
        isot_file: item.isot_file,
        parentSkillDetailId: item.parentSkillDetailId,
      };

      output[parentID].RatedSkills.push(ratedSkill);
    });
   
    const finalResultArray = Object.values(output);

    return finalResultArray;
  }

  displaySelctedSkills() {
    const userSkillDetail = this.sortRatingByLocalStorage();
    
    
    for (let item=0;userSkillDetail.length>item ;item++) {
      const childDivId = document.getElementById('child-'+userSkillDetail[item].parentID)
      console.log(`Parent ID:`,childDivId);
  
      // Inner loop for iterating over RatedSkills array
      for (const ratedSkill of userSkillDetail[item].RatedSkills) {
        // Access the isot_file object
        const isotFile = ratedSkill.isot_file;

        // Check if isot_file exists and has a name property
        if (isotFile && isotFile.name) {
            // Create a div element to display the name
            const nameDiv = document.createElement('div');
            const existPanelDiv = document.getElementsByClassName(ratedSkill.isot_file_id);
            console.log(existPanelDiv,"efrere",)
            nameDiv.innerHTML = `${isotFile.name} <i class="fa fa-close" style="color:red"></i>`;
            existPanelDiv.innerHTML = `${isotFile.name} <i class="fa fa-check" style="color:green"></i>`;
            
            nameDiv.style.background =  "white";
            nameDiv.style.border =  "0.5px solid rgba(0, 125, 252, 0.2)";
            nameDiv.style.padding =  "0px 14px";
            nameDiv.style.borderRadius =  "30px";
            nameDiv.style.marginRight = "10px"
            nameDiv.style.width = "fit-content"

            // Append the div to the childDivId
            childDivId.appendChild(nameDiv);
            
          }       
          // }
        }
  }
  }

  saveTheSkillComment(
    commentValue,
    ratingValue,
    skillDetail,
    parentSkillDetailId
  ) {
    console.log(
      commentValue,
      ratingValue,
      skillDetail,
      "commentValue, ratingValue, skillDetail"
    );
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
          // document.getElementById("RateCloseButton").click();
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
            parentSkillDetailId: parentSkillDetailId,
          });

          this.displaySelctedSkills();
         
          // this.createListProfileSkills();
          // document.getElementById("RateCloseButton").click();
          // this.ratedSkillEvent(skillDetail);
        })
        .catch((err) => console.error(err));
    }
  }

  changeRateModelElement(skillDetail, parentSkillDetailId) {
    console.log(skillDetail, parentSkillDetailId);
    const RateSkillModel = document.getElementById("RateSkillModel");
    const RateSkillModelLabel = document.getElementById("RateSkillModelLabel");
    const spanElementForStar = document.getElementById("spanElementForStar");
    spanElementForStar.style.borderRadius = "10px";
    spanElementForStar.style.height = "12px";

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
    button.style.textTransform = "none";
    button.style.background = "#007DFC";
    button.style.fontSize = "inherit";
    button.style.borderRadius = "6px";
    button.setAttribute("id", "saveChangesButton");

    // Set the button content
    button.textContent = "Save Changes";

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

    const modalContent = RateSkillModel.querySelector(".modal-content");
    if (modalContent) {
      modalContent.style.padding = "20px"; // Adjust the border style as needed
    }
    const modalHeader = RateSkillModel.querySelector(".modal-header");
    if (modalHeader) {
      modalHeader.style.borderBottom = "1px solid #ccc"; // Adjust the border style as needed
    }

    rateSkillCommentBox.value = "";
    spanElementForStar.innerHTML = "";
    const modalEl = new mdb.Modal(RateSkillModel);
    RateSkillModelLabel.style.fontSize = "17px";

    RateSkillModelLabel.innerHTML = `<span style="color: #333333; font-weight:600">Ratings </span>
    <svg height="8" width="8" style="margin: 0px 15px;">
    <circle cx="4" cy="4" r="5" stroke="white" stroke-width="3" fill="#4F4F4F" />
  </svg> <span style="color:#4F4F4F"> ${titleText} </span>`;

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
          skillDetail,
          parentSkillDetailId
        );
        modalEl.hide();
      } else {
        alert("Please rate the skill");
      }
    });
    modalEl.show();
  }

  createSelectSkillsChildBox(htmlElement, skillList, identifier, skillId) {
    const outerDiv = document.createElement("div");
    if (skillList.length > 0) {
      outerDiv.classList.add("card");
      const innerDiv = document.createElement("div");
      innerDiv.classList.add("card");

      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
      cardBody.style.padding = "30px";

      // cardBody.textContent = "skill list";
      this.createSkillSearchButtonList(
        cardBody,
        skillList,
        "",
        identifier,
        skillId
      );
      // Create the three buttons in the card-body using a parent div
      const cardBodyButtonDiv = document.createElement("div");
      const resetChangesButton = createButton(
        "Reset Changes",
        "fas fa-undo",
        "right",
        "",
        true,
        () => {
          // Add logic for reset changes button click
        }
      );

      // Append buttons to the card body
      cardBodyButtonDiv.appendChild(resetChangesButton);
      cardBody.appendChild(cardBodyButtonDiv);
      innerDiv.appendChild(cardBody);
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
      htmlElement.noUiSlider.destroy();
    } catch (error) {
      console.log("error in destroying slider", error);
    }

    let htmlElement1 = document.getElementById("spanElementForStar");
    console.log(skillDetail, "skillDetail");
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
        connect: "lower", // Connect the left side of the range
        tooltips: [false],
      });

      // Style the left part of the slider with a blue background color
      var sliderStyleConnect = document.createElement("style");
      sliderStyleConnect.innerHTML =
        ".noUi-connect { background-color: #007DFC; }";
      document.head.appendChild(sliderStyleConnect);

      const sliderHandleConnects = htmlElement.querySelector(".noUi-connects");
      sliderHandleConnects.style.borderRadius = "10px";

      var sliderStyleHorizontalAndHandle = document.createElement("style");
      sliderStyleHorizontalAndHandle.innerHTML =
        ".noUi-horizontal .noUi-handle { height: 25px; width: 25px;}";
      document.head.appendChild(sliderStyleHorizontalAndHandle);

      var sliderHandleContentTouch = document.createElement("style");
      sliderHandleContentTouch.innerHTML =
        ".noUi-handle:after, .noUi-handle:before { content: none; }";
      document.head.appendChild(sliderHandleContentTouch);

      var sliderHandleLabelLines = document.createElement("style");
      sliderHandleLabelLines.innerHTML =
        ".noUi-marker-large .noUi-marker-sub { display: none; }";
      document.head.appendChild(sliderHandleLabelLines);

      const sliderHandle = htmlElement.querySelector(".noUi-handle-lower");
      sliderHandle.style.background = "#007DFC";
      sliderHandle.style.border = "5px solid white";
      sliderHandle.style.borderRadius = "50%";
      sliderHandle.style.content = "none";
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
    // div.classList.add("mt-3");

    // // Create the outer div element with the class "accordion"
    // var accordionDiv = document.createElement("div");
    // accordionDiv.classList.add("accordion");
    // accordionDiv.id = "ratedskill";

    // // Create the inner div element with the class "accordion-item"
    // var accordionItemDiv = document.createElement("div");
    // accordionItemDiv.classList.add("accordion-item");

    // // Create the h2 element with the class "accordion-header" and id "headingOne"
    // var accordionHeader = document.createElement("h2");
    // accordionHeader.classList.add("accordion-header");
    // accordionHeader.id = "ratedskillheading";

    // // Create the button element with the class "accordion-button" and attributes
    // var accordionTitle = document.createElement("h1");
    // accordionTitle.style.fontSize = "1.5rem";
    // accordionTitle.classList.add("accordion-button");
    // accordionTitle.classList.add("text-dark");

    // accordionTitle.type = "button";
    // accordionTitle.id = "rate-skill-button";
    // accordionTitle.dataset.mdbToggle = "collapse";
    // accordionTitle.dataset.mdbTarget = "#collapsetwo";
    // accordionTitle.setAttribute("aria-expanded", "false");
    // accordionTitle.setAttribute("aria-controls", "collapsetwo");

    // create a span elment with some id in it
    var rateNumber = document.createElement("span");
    rateNumber.id = "rate-skill-span";
    rateNumber.classList.add("text-danger");
    rateNumber.style.marginLeft = "0.5rem";
    rateNumber.style.marginRight = "0.5rem";
    this.rateNumber = rateNumber;
    rateNumber.innerText = this.ratedSelectedSkills.length;

    // accordionTitle.innerText = "Your Profile Skills has ";
    // accordionTitle.appendChild(rateNumber);
    // create a span node with "Skills" text in it
    // var spanElement2 = document.createElement("span");
    // spanElement2.innerText = " Skills";
    // accordionTitle.appendChild(spanElement2);
    // console.log("Value of rate-skill-span:", accordionTitle.textContent);

    console.log(this.ratedSelectedSkills.length, "this.rateNumber.innerHTML");
    setTimeout(function () {
      var value = rateNumber.textContent;

      var elementCountLabel = document.querySelector(".elementCountLabel");
      elementCountLabel.style.width = "fit-content";
      elementCountLabel.style.padding = "10px 30px";
      elementCountLabel.style.margin = "0 auto";
      elementCountLabel.style.borderRadius = "30px";
      if (value > 0) {
        elementCountLabel.style.border = "0.4px solid #21965333";

        elementCountLabel.style.background = "#2196531A";

        elementCountLabel.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#219653" class="bi bi-check-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
    </svg>  ${rateNumber.textContent} element added to your profile`;
      } else {
        elementCountLabel.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#F2994A" class="bi bi-info-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
    </svg> There are no details added to your profile yet`;
        elementCountLabel.style.border = "0.4px solid #F2994A33";
        elementCountLabel.style.background = "#F2994A1A";
      }
    }, 100);
    // Append the button to the h2 element
    // accordionHeader.appendChild(accordionTitle);

    // Create the inner div element with the id "collapsetwo" and class "accordion-collapse collapse show"
    // var accordionCollapseDiv = document.createElement("div");
    // accordionCollapseDiv.id = "collapsetwo";
    // accordionCollapseDiv.classList.add("accordion-collapse", "collapse");
    // accordionCollapseDiv.setAttribute("aria-labelledby", "headingOne");
    // accordionCollapseDiv.setAttribute("data-mdb-parent", "#ratedskill");

    // // Create the inner div element with the class "accordion-body"
    // var accordionBodyDiv = document.createElement("div");
    // accordionBodyDiv.classList.add("accordion-body");

    // // Append the inner div to the outer div
    // accordionCollapseDiv.appendChild(accordionBodyDiv);

    // const cardDiv = document.createElement("div");

    // const cardBodyDiv = document.createElement("div");
    // cardBodyDiv.classList.add("card-body");

    // this.selectedRateSkillDiv = cardBodyDiv;

    // const cardText = document.createElement("p");
    // cardText.classList.add("card-text");
    // cardBodyDiv.appendChild(cardText);

    // cardDiv.appendChild(cardBodyDiv);

    // accordionBodyDiv.appendChild(cardDiv);

    // // Append the h2 and inner div to the accordion item div
    // accordionItemDiv.appendChild(accordionHeader);
    // accordionItemDiv.appendChild(accordionCollapseDiv);

    // // Append the accordion item div to the accordion div
    // accordionDiv.appendChild(accordionItemDiv);

    // // append the card element to the document body

    // div.appendChild(accordionDiv);

    htmlElement.appendChild(div);
  }

  createSkillSelectBox(skillDetail, identifier) {
    const skillDetailArray = JSON.parse(sessionStorage.getItem("items"));
    console.log("createSkillSelectBox --------- ");
    this.searchInputBox.value =
      skillDetailArray !== null ? skillDetailArray[0].name : skillDetail.term;
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
    }

    if (skillDetail.rating_type > 0) {
      cardTitleH4.appendChild(rateButton);
    } else if (
      skillDetail?.skills?.length > 0 &&
      skillDetail?.skills[0].rating_type > 0
    ) {
      cardTitleH4.appendChild(rateButton);
    }

    cardBodyDiv.appendChild(cardTitleH4);

    this.createSkillPath(cardBodyDiv, getListFromsessionStorage());

    if (skillDetail?.skills?.length > 0) {
      skillDetail.skills.forEach((skill) => {
        // clearsessionStorage();
        this.treeSkillAPI(cardBodyDiv, skill._id);
        // this.createSkillPath(cardBodyDiv, getListFromsessionStorage());
      });
    } else {
      this.childrenSkillAPI(skillDetail._id, identifier);
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

  childrenSkillAPI(skillId, identifier) {
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
        this.createSelectSkillsChildBox(
          this.cardBodyDiv,
          response,
          identifier,
          skillId
        );
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

          // this.createSkillPath(cardBodyDiv, response.ancestors);
          // if (response.siblings.length > 0) {
          //   this.createSelectSkillsChildBox(this.cardBodyDiv, response.siblings);
          // } else {
          //   this.childrenSkillAPI(skillId);
          // }
        })
        .catch((err) => console.error(err));
    } else {
      console.log("delete_skill", skill_id);
      removeItemFromlocalStorage(skill_id);
      console.log("deleted_skill");
      // // TODO: delete skill from local storage FOR NOT login user
      // console.log("delete_skill",skill_id)
      // let skill_list = JSON.parse(localStorage.getItem("skill_list"));
      // console.log("delete_skill",skill_list)
      // let new_skill_list = skill_list.filter((skill) => skill.id !== skill_id);
      // console.log("delete_skill",new_skill_list)
      // localStorage.setItem("skill_list", JSON.stringify(new_skill_list));
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
        // this.createSkillPath(cardBodyDiv, response.ancestors);
        if (response.siblings.length > 0) {
          this.createSelectSkillsChildBox(this.cardBodyDiv, response.siblings);
        } else {
          this.childrenSkillAPI(skillId);
        }
      })
      .catch((err) => console.error(err));
  }
}

// fetch(url, {

//   constructor(config) {
//     this.config = config;
//     this.options = {
//       ApiKey: null,
//       divID: null,
//       onSearchSkillClick: null,
//     };
//     if (typeof config == "object") {
//       this.options = {
//         ...this.options,
//         ...config,
//       };
//     }
//     if (this.options.ApiKey && this.options.divID) {
//       this.rapidAPIheaders = {
//         method: "GET",
//         headers: {
//           "X-RapidAPI-Key": this.options.ApiKey,
//           "X-RapidAPI-Host": "iys-skill-api.p.rapidapi.com",
//         },
//       };
//       this.selectedDiv = document.getElementById(this.options.divID);
//       this.currentSkill = null;
//       this.init();
//     } else {
//       console.error("ApiKey  divID not set correctly ");
//     }
//   }

//   init() {
//     this.createFunctionalAreaBox();
//     this.functionalAreaAPI();
//     // this.setupCreateSearchTriggers()
//   }
