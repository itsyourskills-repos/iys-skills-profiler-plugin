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

// check selected childId is exist in  the whole localStorage data
function findObjectByIsotFileId(array, isotFileId) {
  // Iterate through each object in the array
  for (const obj of array) {
    // Check if the RatedSkils array exists in the object
    if (obj.RatedSkills) {
      // Use the find method to search for the object with the specified isot_file_id
      const foundObject = obj.RatedSkills.find(
        (skill) => skill.isot_file_id === isotFileId
      );

      // If found, return the object
      if (foundObject) {
        return foundObject;
      }
    }
  }

  // If no match is found, return null or handle as needed
  return null;
}

// check selected parentId is exist in the whole local storage data
function isParentIdAvailable(array, parentIdToCheck) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].parentID === parentIdToCheck) {
      return array[i]; // ParentId found
    }
  }
  return null; // ParentId not found
}

// change the format of localstorage data
function sortRatingByLocalStorage() {
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

// display selected skill on accordion
function displaySelctedSkills() {
  const userSkillDetail = sortRatingByLocalStorage();

  for (let item = 0; userSkillDetail.length > item; item++) {
    const childDivId = document.getElementById(
      "child-" + userSkillDetail[item].parentID
    );

    childDivId.innerHTML = "";
    // Inner loop for iterating over RatedSkills array
    for (
      let obj = 0;
      obj < 3 && userSkillDetail[item].RatedSkills.length > obj;
      obj++
    ) {
      // Access the isot_file object
      const isotFile = userSkillDetail[item].RatedSkills[obj].isot_file;

      // Check if isot_file exists and has a name property
      if (isotFile && isotFile.name) {
        // Create a div element to display the name
        const nameDiv = document.createElement("div");
        nameDiv.setAttribute(
          "id",
          `selectedRating-${userSkillDetail[item].parentID}`
        );
        const nameDivCrossButton = document.createElement("i");
        nameDivCrossButton.id = "cross-btn-child";
        nameDivCrossButton.setAttribute("class", "fa fa-close");
        nameDivCrossButton.style.color = "red";
        nameDivCrossButton.style.marginLeft = "5px";
        nameDivCrossButton.style.cursor = "pointer";
        nameDivCrossButton.style.padding = "5px";
        nameDivCrossButton.style.zIndex = "10";
        console.log(
          userSkillDetail[item].RatedSkills,
          "userSkillDetail[item].RatedSkills"
        );

        nameDivCrossButton.addEventListener("click", () => {
          delete_skill(isotFile._id);
          if (userSkillDetail[item].RatedSkills.length === 1) {
            document.getElementById(
              `selectedRating-${userSkillDetail[item].parentID}`
            ).style.display = "none";
          }
        });

        nameDiv.textContent = isotFile.name;
        nameDiv.style.background = "white";
        nameDiv.style.zIndex = "9";
        nameDiv.style.border = "0.5px solid rgba(0, 125, 252, 0.2)";
        nameDiv.style.padding = "0px 14px";
        nameDiv.style.borderRadius = "30px";
        nameDiv.style.marginRight = "10px";
        nameDiv.style.width = "fit-content";

        // Append the div to the childDivId
        nameDiv.appendChild(nameDivCrossButton);
        childDivId.appendChild(nameDiv);
      }
    }

    if (userSkillDetail[item].RatedSkills.length > 3) {
      manageModalOnPlusOne(childDivId, userSkillDetail[item]);
    }
  }

  const resetChangesButton = document.getElementById("Reset Changes");

  if (userSkillDetail.length > 0) {
    console.log(userSkillDetail.length > 0, "getdataaa");
    ResetButton(resetChangesButton, false);
  } else {
    ResetButton(resetChangesButton, true);
  }
}

// display elements count
function createSelectedSkillsCount() {
  const htmlElementCount = getListFromlocalStorage();

  var elementCountLabel = document.querySelector(".elementCountLabel");
  elementCountLabel.style.width = "fit-content";
  elementCountLabel.style.padding = "10px 30px";
  elementCountLabel.style.margin = "20px auto";
  elementCountLabel.style.borderRadius = "30px";
  // elementCountLabel.style.zIndex = 99;
  if (htmlElementCount.length > 0) {
    elementCountLabel.style.border = "0.4px solid #21965333";
    elementCountLabel.style.background = "#2196531A";
    elementCountLabel.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#219653" class="bi bi-check-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
</svg>  ${htmlElementCount.length} element added to your profile`;
  } else {
    elementCountLabel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#F2994A" class="bi bi-info-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg> There are no details added to your profile yet`;
    elementCountLabel.style.border = "0.4px solid #F2994A33";
    elementCountLabel.style.background = "#F2994A1A";
  }
}

// Function to create subString of child label
function stringSplit(content) {
  return content.slice(0, 13);
}

// Function to manage tooltip
function manageTooltip(htmlElement, content) {
  htmlElement.addEventListener("mouseover", function () {
    console.log("first");
    const popover = new mdb.Popover(htmlElement, {
      container: "body",
      placement: "top",
      content: content,
      html: true,
      trigger: "hover",
    });

    popover.show();

    setTimeout(() => {
      popover.hide();
    }, 1700);
  });
}

// get data from parentid
function findObjectByParentID(data, parentID) {
  return data.filter((obj) => obj.parentID === parentID);
}

// created modal on +1 button
function manageModalOnPlusOne(htmlElementForPlusOne, contentToShowInModal) {
  const plusOneBtn = document.createElement("buttom");
  plusOneBtn.id = "plusOneBtn";
  plusOneBtn.innerHTML = `+1`;
  plusOneBtn.style.background = "none";
  plusOneBtn.style.border = "none";
  plusOneBtn.style.color = "#007DFC";

  htmlElementForPlusOne.append(plusOneBtn);

  // Create the modal container
  const modalContainer = document.createElement("div");
  modalContainer.id = "plusOneButtonModal";
  modalContainer.style.display = "none";
  modalContainer.style.position = "fixed";
  modalContainer.style.top = "0";
  modalContainer.style.left = "0";
  modalContainer.style.width = "100%";
  modalContainer.style.height = "100%";
  modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modalContainer.style.justifyContent = "center";
  modalContainer.style.alignItems = "center";
  modalContainer.style.zIndex = "99";
  document.body.appendChild(modalContainer);

  // Create the modal content
  const modalContent = document.createElement("div");
  modalContent.style.width = "50%";
  modalContent.style.background = "#fff";
  modalContent.style.padding = "32px";
  modalContent.style.borderRadius = "4px";
  modalContainer.appendChild(modalContent);

  // Create the modal header
  const modalHeader = document.createElement("div");
  modalHeader.style.display = "flex";
  modalHeader.style.justifyContent = "space-between";
  modalHeader.style.borderBottom = "1px solid #ddd";
  modalHeader.style.marginBottom = "10px";
  modalHeader.style.paddingBottom = "5px";
  modalContent.appendChild(modalHeader);

  // Create the header content
  const headerContent = document.createElement("div");
  headerContent.style.display = "flex";
  headerContent.style.alignItems = "center";
  modalHeader.appendChild(headerContent);

  // Create the modal title
  const modalTitle = document.createElement("span");
  modalTitle.style.fontSize = "16px";
  modalTitle.style.fontWeight = 600;
  modalTitle.style.color = "#333333";
  modalTitle.innerHTML =
    contentToShowInModal.RatedSkills[0].isot_file.tags_data[0].title;
  headerContent.appendChild(modalTitle);

  // Create the dot separator
  const modalDotHeader = document.createElement("div");
  modalDotHeader.style.width = "8px";
  modalDotHeader.style.height = "8px";
  modalDotHeader.style.background = "#BDBDBD";
  modalDotHeader.style.borderRadius = "50%";
  modalDotHeader.style.margin = "0 10px";
  headerContent.appendChild(modalDotHeader);

  // Create the count of elements selected
  const modalTitleElementCount = document.createElement("span");
  modalTitleElementCount.style.fontWeight = 600;
  modalTitleElementCount.style.color = "#828282";
  modalTitleElementCount.style.fontSize = "14px";
  modalTitleElementCount.innerHTML =
    contentToShowInModal?.RatedSkills.length + " " + "elements selected";
  headerContent.appendChild(modalTitleElementCount);

  // Create the main content of modal
  const modalContentMainParent = document.createElement("div");
  modalContentMainParent.id = "modalContentMainParent";
  modalContentMainParent.style.height = "427px";
  modalContentMainParent.style.overflow = "auto";

  // Clear existing content
  modalContentMainParent.innerHTML = "";

  for (const obj of contentToShowInModal.RatedSkills) {
    const ratingGet = obj?.isot_file.rating?.options;

    const modalContentParent = document.createElement("div");
    modalContentParent.id = `modalContentParent-${obj?.isot_file._id}`;
    modalContentParent.style.display = "flex";
    modalContentParent.style.justifyContent = "space-between";
    modalContentParent.style.border = "1px solid #E6E6E6";
    modalContentParent.style.padding = "12px";
    modalContentParent.style.borderRadius = "4px";
    modalContentParent.style.margin = "15px 0px";

    const modalLeftContent = document.createElement("div");
    modalLeftContent.id = "modalLeftContent";

    const modalLeftFirstContent = document.createElement("span");
    modalLeftFirstContent.id = "modalLeftFirstContent";
    modalLeftFirstContent.innerHTML = obj?.isot_file.name;
    modalLeftFirstContent.style.fontWeight = 500;
    modalLeftFirstContent.style.fontSize = "14px";
    modalLeftFirstContent.style.color = "#828282";
    modalLeftContent.appendChild(modalLeftFirstContent);

    const modalLeftSecondContent = document.createElement("span");
    modalLeftSecondContent.id = "modalLeftSecondContent";
    modalLeftSecondContent.innerHTML = ratingGet[obj?.rating - 1];
    modalLeftSecondContent.style.margin = "0 0 0 10px";
    modalLeftSecondContent.style.padding = "4px 12px";
    modalLeftSecondContent.style.borderRadius = "100px";
    modalLeftSecondContent.style.border = "1px solid #F2994A33";
    modalLeftSecondContent.style.fontSize = "12px";
    modalLeftSecondContent.style.fontWeight = 500;
    modalLeftContent.appendChild(modalLeftSecondContent);

    const modalRightContent = document.createElement("div");
    modalRightContent.id = "modalRightContent";

    const modalRightFirstContent = document.createElement("span");
    modalRightFirstContent.id = "modalRightFirstContent";
    modalRightFirstContent.textContent = "View Details";
    modalRightFirstContent.style.display =
      obj?.comment !== "" ? "initial" : "none";
    modalRightFirstContent.style.fontWeight = 500;
    modalRightFirstContent.style.fontSize = "12px";
    modalRightFirstContent.style.color = "#007DFC";
    modalRightFirstContent.style.cursor = "pointer";

    manageTooltip(modalRightFirstContent, obj?.comment);

    modalRightContent.appendChild(modalRightFirstContent);

    const modalRightSecondContent = document.createElement("button");
    modalRightSecondContent.id = "modalRightSecondContent";
    modalRightSecondContent.style.background = "transparent";
    modalRightSecondContent.style.border = "none";
    modalRightSecondContent.style.margin = "0px 0px 0px 10px";
    modalRightSecondContent.innerHTML =
      '<i class="fa fa-trash" style="color:red"></i>';

    modalRightSecondContent.addEventListener("click", () => {
      delete_skill(obj?.isot_file._id);
      const userSkillDetail = sortRatingByLocalStorage();
      const result = findObjectByParentID(
        userSkillDetail,
        contentToShowInModal.parentID
      );
      if (result.length === 0) {
        // Find the element with the class "accordion accordion-true"
        const accordionElement = document.querySelector(
          ".accordion.accordion-true"
        );

        // Check if the element is found
        if (accordionElement) {
          // Update the class to "accordion accordion-false"
          accordionElement.click();
        }

        document.getElementById(
          `selectedRating-${contentToShowInModal.parentID}`
        ).style.display = "none";

        modalContainer.style.display = "none";
      }
      document.getElementById(
        `modalContentParent-${obj?.isot_file._id}`
      ).style.display = "none";
    });
    modalRightContent.appendChild(modalRightSecondContent);

    modalContentParent.appendChild(modalLeftContent);
    modalContentParent.appendChild(modalRightContent);
    modalContentMainParent.appendChild(modalContentParent);
  }

  modalContent.appendChild(modalContentMainParent);

  // Create the close button for the modal
  const closeModalBtn = document.createElement("button");
  closeModalBtn.id = "closeModal";
  closeModalBtn.style.background = "none";
  closeModalBtn.style.border = "none";
  closeModalBtn.style.fontSize = "25px";
  closeModalBtn.innerHTML = "&times;";
  modalHeader.appendChild(closeModalBtn);

  // Event listener for the +1 button to show the modal
  plusOneBtn.addEventListener("click", () => {
    modalContainer.style.display = "flex";
  });

  // Event listener for the close button to hide the modal
  closeModalBtn.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });
}

// create label
function createLabel(content) {
  const inputLabel = document.createElement("label");
  inputLabel.innerHTML = content;
  inputLabel.style.fontWeight = 500;

  return inputLabel;
}

// create Input field
function createInput(type, placeholder) {
  const inputField = document.createElement("input");
  inputField.type = type;
  inputField.placeholder = placeholder;
  inputField.style.width = "calc(100%)";
  inputField.style.border = "none";
  inputField.style.padding = "13px 16px 13px 16px";

  return inputField;
}

// Helper function to create error message
function createErrorMessage() {
  const errorMessage = document.createElement("div");
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "5px";
  errorMessage.style.display = "none";
  return errorMessage;
}

// Helper function to display error message
function displayErrorMessage(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Helper function to hide error message
function hideErrorMessage(errorElement) {
  errorElement.textContent = "";
  errorElement.style.display = "none";
}

// Helper function to create the dropdown (select element)
function createDropdown() {
  const dropdown = document.createElement("select");
  dropdown.style.width = "100%";
  dropdown.style.padding = "13px";
  dropdown.style.border = "1px solid #E6E6E6";
  dropdown.style.borderRadius = "4px";
  dropdown.style.marginBottom = "10px";
  dropdown.style.background = "white";
  dropdown.style.fontSize = "1em";
  dropdown.style.appearance = "none";
  dropdown.style.backgroundImage = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;
  dropdown.style.backgroundRepeat = "no-repeat";
  dropdown.style.backgroundPosition = "right 9px center";
  dropdown.style.backgroundSize = "1em";

  const defaultOption = document.createElement("option");
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.value = "";
  defaultOption.text = "Select Category";
  dropdown.appendChild(defaultOption);

  const optionsArray = [
    "Profile and Occupation",
    "Knowledge and Skills",
    "Tools and Technologies",
    "Activities",
    "Domain or Context",
  ];
  const options = {};

  optionsArray.forEach((optionText, index) => {
    options[index + 1] = createDropdownOption(optionText);
    dropdown.appendChild(options[index + 1]);
  });

  return dropdown;
}

// helper function to create dropdown options
function createDropdownOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.text = value;
  return option;
}

// validation for email
function isValidEmail(email) {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(email);
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
function ResetButton(htmlElement, disabled) {
  htmlElement.innerHTML = `<i class="fas fa-undo"></i> Reset Changes`;
  htmlElement.id = "Reset Changes";
  htmlElement.style.padding = "5px 15px";
  htmlElement.style.borderRadius = "5px";
  htmlElement.style.border = disabled ? "" : "1px solid #007DFC";
  htmlElement.style.background = "transparent";
  htmlElement.style.color = disabled ? "" : "#007DFC";
  htmlElement.style.float = "right";
  htmlElement.disabled = disabled;

  if (!disabled) {
    htmlElement.addEventListener("click", (event) => {
      event.preventDefault();
      htmlElement.disabled = true;
      htmlElement.style.border = "";
      htmlElement.style.color = "";
      const elements = document.querySelectorAll('[id^="selectedRating-"]');

      // Iterate through each element and apply the style
      elements.forEach((element) => {
        element.style.display = "none";
      });

      clearlocalStorage();

      createSelectedSkillsCount();
    });
  }

  return htmlElement;
}

// Function to handle API calling for  "Add Skill" button click
function addSkillToApi(payload) {
  // API endpoint (replace with your actual API endpoint)

  const apiEndpoint = `https://5fr8r16ski.execute-api.us-east-1.amazonaws.com/stage/v2/ISOT/add/skills?name=${payload.name}&cat=${payload.cat}&email=${payload.email}`;

  // Make the API call using the fetch API
  return fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any additional headers if needed
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Handle the API response data as needed
      document.getElementById("plugin-search-id-close-button").click();
      console.log("API response:", data);
      return data; // You can return the data if needed
    })
    .catch((error) => {
      console.error("API error:", error);
      throw error; // You can throw the error for further handling
    });
}

function delete_skill(skill_id) {
  if (isLoginUser) {
    console.log("skill_id", skill_id);

    let csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;
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
        displaySelctedSkills();
        createSelectedSkillsCount();

        // this.createSkillPath(cardBodyDiv, response.ancestors);delete
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
    displaySelctedSkills();
    createSelectedSkillsCount();
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
    clearIcon.id = "plugin-search-id-close-button";
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
      button.style.display = "block";
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
    button.style.position = "absolute";
    button.style.right = "0";
    button.style.height = "78%";
    button.style.top = "0px";

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
    divDropDown.style.height = "auto";
    divDropDown.style.boxShadow = "0px 0px 12px 0px #0000000F";
    divDropDown.style.marginTop = "12px";
    divDropDown.style.borderRadius = "12px";
    divDropDown.style.width = "94.5%";
    divDropDown.style.position = "absolute";
    divDropDown.style.zIndex = "9";
    divDropDown.style.background = "#fff";

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

    const emailInputLabel = createLabel(
      'Email <span style="color:red">*</span>'
    );
    modalContent.appendChild(emailInputLabel);

    const emailFieldContainer = document.createElement("div");
    emailFieldContainer.style.position = "relative";
    emailFieldContainer.style.marginBottom = "10px";
    modalContent.appendChild(emailFieldContainer);

    const emailInputField = createInput("text", "Enter Your Email");
    emailInputField.style.width = "calc(100%)";
    emailInputField.style.border = "1px solid #E6E6E6";
    emailInputField.style.borderRadius = "4px";
    emailInputField.style.padding = "13px 16px 13px 16px";
    emailFieldContainer.appendChild(emailInputField);

    // Create the first input field with label
    const elementInputLabel = createLabel(
      'Element <span style="color:red">*</span>'
    );
    modalContent.appendChild(elementInputLabel);

    const elementFieldContainer = document.createElement("div");
    elementFieldContainer.style.position = "relative";
    elementFieldContainer.style.marginBottom = "10px";
    modalContent.appendChild(elementFieldContainer);

    const elementInputField = createInput("text", "Enter Your Name");
    elementInputField.value = searchText;
    elementInputField.style.width = "calc(100%)";
    elementInputField.style.border = "1px solid #E6E6E6";
    elementInputField.style.borderRadius = "4px";
    elementInputField.style.padding = "13px 16px 13px 16px";
    elementInputField.addEventListener("input", () => {
      // Show or hide the clear icon based on input content
      elementClearIcon.style.display = elementInputField.value
        ? "block"
        : "none";
    });
    elementFieldContainer.appendChild(elementInputField);

    // Create the container for dropdown
    const inputContainer2 = createInputContainer(
      'Category <span style="color:red">*</span>'
    );
    // Create the dropdown (select element)
    const dropdown = createDropdown();
    inputContainer2.appendChild(dropdown);

    // Create error messages
    const emailError = createErrorMessage();
    emailFieldContainer.appendChild(emailError);

    const elementError = createErrorMessage();
    elementFieldContainer.appendChild(elementError);

    const categoryError = createErrorMessage();
    inputContainer2.appendChild(categoryError);

    // Add cross icon to clear input field
    const elementClearIcon = document.createElement("span");
    elementClearIcon.innerHTML = "&times;";
    elementClearIcon.style.position = "absolute";
    elementClearIcon.style.right = "10px";
    elementClearIcon.style.top = "9px";
    elementClearIcon.style.cursor = "pointer";
    elementClearIcon.style.color = "rgb(255 0 0)";
    elementClearIcon.style.fontSize = "20px";
    elementClearIcon.style.zIndex = "9";

    elementClearIcon.addEventListener("click", () => {
      elementInputField.value = "";

      displayErrorMessage(elementError, "Element name is required");

      elementClearIcon.style.display = "none"; // Hide the clear icon after clearing input
    });
    elementFieldContainer.appendChild(elementClearIcon);

    // Event listener for input fields
    emailInputField.addEventListener("input", () => {
      const emailValue = emailInputField.value.trim();

      if (emailValue === "") {
        displayErrorMessage(emailError, "Email is required");
      } else if (emailValue) {
        if (isValidEmail(emailValue)) {
          hideErrorMessage(emailError);
        } else {
          displayErrorMessage(emailError, "Enter a valid email address");
        }
      } else {
        hideErrorMessage(emailError);
      }
    });

    elementInputField.addEventListener("input", () => {
      const elementValue = elementInputField.value.trim();

      if (elementValue === "") {
        displayErrorMessage(elementError, "Element name is required");
      } else {
        hideErrorMessage(elementError);
      }
    });

    dropdown.addEventListener("change", () => {
      const selectedCategory = dropdown.value;

      if (!selectedCategory) {
        displayErrorMessage(categoryError, "Category is required");
      } else {
        hideErrorMessage(categoryError);
      }
    });

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
      // Get the values from elementInputField and dropdownButton
      const emailValue = emailInputField.value.trim();
      const elementValue = elementInputField.value.trim();
      const selectedCategory = dropdown.value;

      const reqData = {
        name: elementValue,
        cat: selectedCategory,
        email: emailValue,
      };

      // Check Validate email
      if (emailValue === "") {
        displayErrorMessage(emailError, "Email is required");
      } else if (emailValue) {
        if (isValidEmail(emailValue)) {
          hideErrorMessage(emailError);
        } else {
          displayErrorMessage(emailError, "Enter a valid email address");
        }
      } else {
        hideErrorMessage(emailError);
      }

      // Validate element
      if (elementValue === "") {
        displayErrorMessage(elementError, "Element name is required");
      } else {
        hideErrorMessage(elementError);
      }

      // Validate category
      if (selectedCategory === "") {
        displayErrorMessage(categoryError, "Category is required");
      } else {
        hideErrorMessage(categoryError);
      }

      // Check if any error exists
      if (
        emailValue === "" ||
        elementValue === "" ||
        selectedCategory === "" ||
        emailError.textContent !== ""
      ) {
        return; // Do not proceed if there are errors
      }

      // Call the API function with the payload
      addSkillToApi(reqData)
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

      const label = createLabel(labelText);
      container.appendChild(label);

      return container;
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
    createSelectedSkillsCount();
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
    const userSkillDetail = sortRatingByLocalStorage();
    const isParentAvailable = isParentIdAvailable(
      userSkillDetail,
      skillDetail._id
    );
    console.log(userSkillDetail, isParentAvailable, "userSkillDetail");
    var parentDiv = document.createElement("div");
    parentDiv.style.width = "100%";
    parentDiv.style.textAlign = "left";
    parentDiv.style.display = "flex";
    parentDiv.style.justifyContent = "space-between";
    parentDiv.setAttribute("class", "accordion accordion-false");
    parentDiv.setAttribute("id", "parent-" + skillDetail._id);

    var childDiv = document.createElement("div");

    childDiv.setAttribute("id", "child-" + skillDetail._id);
    childDiv.style.display = "flex";

    if (isParentAvailable) {
      for (
        let obj = 0;
        obj < 3 && isParentAvailable.RatedSkills.length > obj;
        obj++
      ) {
        const nameDiv = document.createElement("div");
        const nameDivCrossButton = document.createElement("i");
        nameDivCrossButton.id = "cross-btn-child";
        nameDivCrossButton.setAttribute("class", "fa fa-close");
        nameDivCrossButton.style.color = "red";
        nameDivCrossButton.style.marginLeft = "5px";
        nameDivCrossButton.style.cursor = "pointer";
        nameDivCrossButton.style.padding = "5px";
        nameDivCrossButton.style.zIndex = "10";

        nameDiv.setAttribute(
          "id",
          `selectedRating-${isParentAvailable.parentID}`
        );

        nameDiv.style.background = "white";
        nameDiv.style.zIndex = "9";
        nameDiv.style.border = "0.5px solid rgba(0, 125, 252, 0.2)";
        nameDiv.style.padding = "0px 14px";
        nameDiv.style.borderRadius = "30px";
        nameDiv.style.marginRight = "10px";
        nameDiv.style.width = "fit-content";
        nameDiv.textContent = isParentAvailable.RatedSkills[obj].isot_file.name;

        nameDiv.appendChild(nameDivCrossButton);
        console.log(
          isParentAvailable.RatedSkills,
          "isParentAvailable.RatedSkills.length"
        );
        nameDivCrossButton.addEventListener("click", () => {
          delete_skill(isParentAvailable.RatedSkills[obj].isot_file_id);
          if (isParentAvailable.RatedSkills.length === 1) {
            document.getElementById(
              `selectedRating-${isParentAvailable.parentID}`
            ).style.display = "none";
          }
        });
        childDiv.append(nameDiv);
      }
      if (isParentAvailable.RatedSkills.length > 3) {
        manageModalOnPlusOne(childDiv, isParentAvailable);
      }
    }

    if (identifier === "accordionChild") {
      htmlElement.innerHTML = "";
      var skilldetailKey = document.getElementById(uniqueIdentifier);
      const foundObject = findObjectByIsotFileId(
        userSkillDetail,
        skillDetail._id
      );

      var panelDiv = document.createElement("button");
      panelDiv.setAttribute("class", skillDetail._id);
      panelDiv.style.border = "1px solid grey";
      panelDiv.style.borderRadius = "30px";
      panelDiv.style.margin = "5px";
      panelDiv.style.padding = "5px";
      panelDiv.style.background = "white";

      var infoDesBtn = document.createElement("i");

      if (foundObject) {
        panelDiv.style.border = "0.4px solid #21965333";
        panelDiv.setAttribute("class", `${skillDetail._id} selected-skills`);

        if (skillDetail.name.toString().length > 13) {
          panelDiv.innerHTML = `<i class="fa fa-check"></i> ${stringSplit(
            skillDetail.name
          )}... `;
        } else {
          panelDiv.innerHTML = `<i class="fa fa-check"></i> ${skillDetail.name}`;
        }

        infoDesBtn.setAttribute("class", "infoSelectedSkill");
        infoDesBtn.innerHTML =
          ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007DFC" class="bi bi-info-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" > <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';

        if (skillDetail) {
          manageTooltip(
            panelDiv,
            `<div>
          <b style="border-bottom :1px solid gray"> ${skillDetail.name} </b>
          <p> Description - ${skillDetail.name}</p>
        </div>`
          );
        }
      } else {
        if (skillDetail.name.toString().length > 13) {
          panelDiv.innerHTML = `${stringSplit(skillDetail.name)}... `;
          manageTooltip(
            panelDiv,
            `<div>
            <b style="border-bottom :1px solid gray"> ${skillDetail.name} </b></div>`
          );
        } else {
          panelDiv.innerHTML = `${skillDetail.name}`;
        }
      }

      panelDiv.addEventListener("click", () => {
        this.changeRateModelElement(skillDetail, uniqueIdentifier);
      });

      panelDiv.appendChild(infoDesBtn);
      skilldetailKey.appendChild(panelDiv);
    } else {
      if (isFuncSkill) {
        parentDiv.innerHTML = `<span><i class="fas fa-plus mr-1"  style="color:#007DFC; padding-left:5px;"></i></span>`;
      } else if (skillDetail.child_count > 0) {
        parentDiv.innerHTML = `<span><i class="fas fa-plus mr-1"  style="color:#007DFC;  padding:0px 10px;" ></i>${skillDetail.name}</span> `;
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
            parentDiv.getAttribute("class") === "accordion accordion-false";

          if (isExpanded) {
            this.childrenSkillAPI(skillDetail._id, "accordionChild");
            parentDiv.setAttribute("class", String(`accordion accordion-true`));
          } else {
            document.getElementById(skillDetail._id).innerHTML = "";
            parentDiv.setAttribute(
              "class",
              String(`accordion accordion-false`)
            );
          }
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
            content: skillDetail.name,
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
      parentDiv.style.padding = "10px 12px";
      parentDiv.style.fontSize = "105%";

      parentDiv.appendChild(childDiv);
      htmlElement.appendChild(parentDiv);

      var skillDetailChild = document.createElement("div");
      skillDetailChild.style.padding = "10px";
      skillDetailChild.classList.add("panel");
      // skillDetailChild.style.justifyContent = "space-around";
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

  saveTheSkillComment(
    commentValue,
    ratingValue,
    skillDetail,
    parentSkillDetailId
  ) {
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

          displaySelctedSkills();
          createSelectedSkillsCount();
          document.getElementById(parentSkillDetailId).innerHTML = "";
          document.getElementById("parent-" + parentSkillDetailId).click();

          // this.createListProfileSkills();
          // document.getElementById("RateCloseButton").click();
          // this.ratedSkillEvent(skillDetail);
        })
        .catch((err) => console.error(err));
    }
  }

  changeRateModelElement(skillDetail, parentSkillDetailId) {
    console.log("changeRateModelElement", skillDetail, parentSkillDetailId);
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
    // spanElementForStar.innerHTML = "";
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
    const cardBody = document.createElement("div");
    if (skillList.length > 0) {
      cardBody.classList.add("card-body-accordion");

      this.createSkillSearchButtonList(
        cardBody,
        skillList,
        "",
        identifier,
        skillId
      );
      // Create the three buttons in the card-body using a parent div
      const cardBodyButtonDiv = document.createElement("div");
      const getdata = getListFromlocalStorage();
      if (!identifier) {
        const button = document.createElement("button");
        const resetChangesButton = ResetButton(
          button,
          getdata?.length > 0 ? false : true
        );
        cardBodyButtonDiv.appendChild(resetChangesButton);
      }
      // Append buttons to the card body
      cardBody.appendChild(cardBodyButtonDiv);
    } else {
      cardBody.innerHTML = "";
    }
    htmlElement.appendChild(cardBody);
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
    nav.setAttribute("class", "breadcrumb-nav");
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
              delete_skill(skill.id);
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
          delete_skill(skill.isot_file_id);
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

    // // create a span elment with some id in it
    // var rateNumber = document.createElement("span");
    // rateNumber.id = "rate-skill-span";
    // rateNumber.classList.add("text-danger");
    // rateNumber.style.marginLeft = "0.5rem";
    // rateNumber.style.marginRight = "0.5rem";
    // this.rateNumber = rateNumber;
    // rateNumber.innerText = this.ratedSelectedSkills.length;

    // accordionTitle.innerText = "Your Profile Skills has ";
    // accordionTitle.appendChild(rateNumber);
    // // create a span node with "Skills" text in it
    // var spanElement2 = document.createElement("span");
    // spanElement2.innerText = " Skills";
    // accordionTitle.appendChild(spanElement2);
    // console.log("Value of rate-skill-span:", accordionTitle.textContent);

    // console.log(this.ratedSelectedSkills.length, "this.rateNumber.innerHTML");
    // // setTimeout(function () {
    // var value = rateNumber.textContent;

    // // var elementCountLabel = document.querySelector(".elementCountLabel");
    // // elementCountLabel.style.width = "fit-content";
    // // elementCountLabel.style.padding = "10px 30px";
    // // elementCountLabel.style.margin = "0 auto";
    // // elementCountLabel.style.borderRadius = "30px";
    // // if (value > 0) {
    // //   elementCountLabel.style.border = "0.4px solid #21965333";

    // //   elementCountLabel.style.background = "#2196531A";

    // //   elementCountLabel.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#219653" class="bi bi-check-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
    // //   <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    // //   <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
    // // </svg>  ${rateNumber.textContent} element added to your profile`;
    // // } else {
    // //   elementCountLabel.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#F2994A" class="bi bi-info-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" >
    // //   <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    // //   <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
    // // </svg> There are no details added to your profile yet`;
    // //   elementCountLabel.style.border = "0.4px solid #F2994A33";
    // //   elementCountLabel.style.background = "#F2994A1A";
    // // }
    // // }, 100);
    // // Append the button to the h2 element
    // accordionHeader.appendChild(accordionTitle);

    // // Create the inner div element with the id "collapsetwo" and class "accordion-collapse collapse show"
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
    cardBodyDiv.id = "card-body-accordion";

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
    // Get the element with the class ".card-body"
    const skillIdElement = document.getElementById(skillId);
    const selectedSkillDiv = document.querySelector(".breadcrumb-nav");

    // Check if the element exists
    if (skillIdElement) {
      const previousContent = skillIdElement.innerHTML;
      // Create and append the loader
      const loader = document.createElement("div");
      loader.className = "loader";
      skillIdElement.innerHTML = ""; // Clear previous content
      skillIdElement.appendChild(loader);

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
          skillIdElement.removeChild(loader);
          skillIdElement.innerHTML = previousContent;
          this.createSelectSkillsChildBox(
            this.cardBodyDiv,
            response,
            identifier,
            skillId
          );
        })
        .catch((err) => {
          console.error(err);
          skillIdElement.removeChild(loader);
          skillIdElement.innerHTML = previousContent;
        })
        .finally((err) => {});
    } else {
      const previousContent = selectedSkillDiv.innerHTML;
      // Create and append the loader
      const loader = document.createElement("div");
      loader.className = "loader";
      loader.style.margin = "100px auto";
      selectedSkillDiv.appendChild(loader);

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
          selectedSkillDiv.removeChild(loader);
          selectedSkillDiv.innerHTML = previousContent;

          this.createSelectSkillsChildBox(
            this.cardBodyDiv,
            response,
            identifier,
            skillId
          );
        })
        .catch((err) => {
          selectedSkillDiv.removeChild(loader);
          selectedSkillDiv.innerHTML = previousContent;

          console.error(err);
        });
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
      .catch((err) => {
        console.error(err);
      });
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
