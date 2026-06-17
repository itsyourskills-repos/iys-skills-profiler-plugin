var isLoginUser = JSON?.parse(localStorage?.getItem("loginUserDetail"))
  ? true
  : false;
const ENDPOINT_URL = "https://lambdaapi.iysskillstech.com/latest/dev-api/";
const loggedInUserApiEndpoint = `https://api.myskillsplus.com/get-skills/`;
const loggedInUserAddSkill = `https://api.myskillsplus.com/add-skills/`;
const deleteSkillApiEndpoint = `https://api.myskillsplus.com/delete-skill/`;
const getaccessYokenEndpoint =
  "https://api.myskillsplus.com/api/token/refresh/";
const getAccessToken = JSON.parse(localStorage.getItem("tokenData"));
const logginUserDetail = JSON.parse(localStorage.getItem("loginUserDetail"));
const imagePath =
  "https://cdn.jsdelivr.net/gh/itsyourskills-repos/iys-skills-profiler-plugin@main/assets/img/";

var iysplugin = JSON.parse(localStorage.getItem("iys"));
if (iysplugin == null) {
  iysplugin = {};
  iysplugin.tap = "all";
  iysplugin.profile_view = "all";
  iysplugin.isEdit = true;
  iysplugin.isDelete = true;
  iysplugin.doughnt = true;
  iysplugin.experience = true;
  iysplugin.save_button = true;
}

function fetchData(url, method) {
  return fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken?.access}`,
    },
  })
    .then((response) => {
      if (response.status === 429) {
        // Redirect to /limit-exceeded/ page
        window.location.href = "limit-exceeded.html";
      }
      return response.json();
    })
    .then((data) => {
      // You can perform additional operations with the data here if needed
      return data;
    })
    .catch((err) => {
      console.log(err);
    });
}

function groupByTagsName(data) {
  const groupedData = {};

  data.forEach((item) => {
    const tagTitle = item.tags[0]?.title;

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
      existingItem.path_addr === item.path_addr &&
      existingItem.path_addr === item.path_addr
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
  let userRatedSkills = JSON.parse(
    localStorage.getItem("userRatedSkills", "[]")
  );

  // example for isot_file_id =13279269.12962433.12901833.12116859
  // get the last two id from isot_file_id in this case 12901833.12116859
  const lastTwoId = isotFileId.split(".").slice(-2).join(".");
  // checking it atlest have parent id
  if (lastTwoId.split(".").length >= 2 && userRatedSkills) {
    const foundObject = userRatedSkills.find((skill) =>
      skill.isot_file_id.endsWith(lastTwoId)
    );
    if (foundObject) {
      return foundObject;
    }
  }

  // If no match is found, return null or handle as needed
  return null;
}

function checkElementExist(skillDetail) {
  if (localStorage.getItem("logginUserRatedSkills")) {
    let userRatedSkills = JSON.parse(
      localStorage.getItem("logginUserRatedSkills", "[]")
    );

    const skillPathAddr = skillDetail.path_addr;
    const skillEndId = skillPathAddr.split('.').pop();
    let foundObject = userRatedSkills?.find((skill) =>
      skill.isot_path_addr?.endsWith(skillEndId) ||  skill.isot_file_id?.endsWith(skillEndId)
    );
    if (foundObject) {
      return foundObject;
    } else {
      return null;
    }
  } else {
    let userRatedSkills = JSON.parse(
      localStorage.getItem("userRatedSkills", "[]")
    );
    const skillPathAddr = skillDetail.path_addr;
    const skillEndId = skillPathAddr.split('.').pop();

    let foundObject = userRatedSkills?.find((skill) =>
      skill.isot_file_id.endsWith(skillEndId)
    );
    if (foundObject) {
      return foundObject;
    } else {
      return null;
    }
  }
}

// check selected parentId is exist in the whole local storage data

function isParentIdAvailable(array, parentIdToCheck) {
  for (let i = 0; i < array.length; i++) {
    if (array[i]?.parentID && array[i]?.parentID === parentIdToCheck) {
      return array[i]; // ParentId found
    }
  }
  return null; // ParentId not found
}

// change the format of localstorage data
function sortRatingByLocalStorage() {
  let output = {},
    inputArray;
  const getLoggedInUser = getLoggedInUserListFromlocalStorage();
  if (getLoggedInUser && getLoggedInUser.length > 0) {
    inputArray = getLoggedInUser;
  } else {
    inputArray = getListFromlocalStorage();
  }
  inputArray?.forEach((item) => {
    const parentID = item?.ancestors
      ? item?.ancestors[0]?.path_addr
      : item?.parentSkillDetailId;
    if (!output[parentID]) {
      output[parentID] = {
        parentID,
        RatedSkills: [],
      };
    }
    const ratedSkill = {
      id: item?.id,
      comment:
        item?.rating && item?.rating?.length > 0
          ? item?.rating[0]?.comment
          : item.ratings && item.ratings.length > 0
          ? item.ratings[0].comment
          : item?.comment,
      rating: item?.rating?.[0]?.rating ?? item?.ratings?.[0]?.rating ?? 0,
      isot_file_id: item?.isot_file_id || item?.isot_path_addr,
      isot_file: item?.isot_file || item?.isot_skill,
      parentSkillDetailId: item?.parentSkillDetailId
        ? item?.parentSkillDetailId
        : item?.ancestors && item?.ancestors[0]?.path_addr,
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
    if (childDivId) {
      childDivId.innerHTML = "";
      manageModalOnPlusOne(childDivId, userSkillDetail[item]);
    }
  }

  const resetChangesButton = document.getElementById("Reset Changes");

  if (userSkillDetail.length > 0) {
    ResetButton(resetChangesButton, false);
  } else {
    ResetButton(resetChangesButton, true);
  }
}

// function to caluclate all the ratings
function sumRatings(data) {
  let totalRating = 0;

  data.forEach((item) => {
    if (
      item.RatedSkills &&
      Array.isArray(item.RatedSkills)
    ) {
      totalRating += item.RatedSkills.length;
    }
  });
  return totalRating;
}

// display all the elements count
function createSelectedSkillsCount() {
  const htmlElementCount = sortRatingByLocalStorage();
  const sumofAllRatings = sumRatings(htmlElementCount);
  var elementCountLabel = document.querySelector(".elementCountLabel");
  elementCountLabel.innerHTML = `<button class="element-div-profile-link" id='profile-link' href="#" onclick="openProfileTab()">My Skills</button>`;
}

// Function to create subString of child label
function createSubString(originalText) {
  let words = originalText.split(" ");
  let firstTwoWords = words.slice(0, 2).join(" ");
  return firstTwoWords;
}

// function to count first 2 words
function wordCount(str) {
  return str.split(" ").length;
}

// Function to manage tooltip
function manageTooltip(htmlElement, content) {
  htmlElement.addEventListener("mouseover", function () {
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

function searchByName(searchName,pathAddr) {
  const data = sortRatingByLocalStorage();
  const searchResult = [];
  data.forEach((item) => {
    item.RatedSkills.forEach((skill) => {
      const skillPathAddr = skill.isot_file.path_addr;
      const skillNameMatches = skill.isot_file.name.toLowerCase().includes(searchName.toLowerCase());
      const skillEndId = skillPathAddr.split('.').pop();
      const pathAddrEndId = pathAddr.split('.').pop();
      if (skillEndId === pathAddrEndId && skillNameMatches) {
        searchResult.push(skill);
      }
    });
  });
  return searchResult;
}

// created modal on +1 button
function manageModalOnPlusOne(htmlElementForPlusOne, contentToShowInModal) {
  const plusOneBtn = document.createElement("buttom");
  plusOneBtn.id = "plusOneBtn";
  plusOneBtn.innerHTML = `${contentToShowInModal?.RatedSkills?.length} Selected skills`;
  plusOneBtn.style.background = "none";
  plusOneBtn.style.border = "none";
  plusOneBtn.style.color = "#007DFC";
  plusOneBtn.style.cursor = "pointer";
  plusOneBtn.style.fontSize = "16px";
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
    contentToShowInModal.RatedSkills[0].isot_file.tags[0].title;
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
  modalTitleElementCount.id = "rating-modal-element-count";
  modalTitleElementCount.setAttribute(
    "data-count",
    contentToShowInModal?.RatedSkills?.length
  );
  modalTitleElementCount.style.fontWeight = 600;
  modalTitleElementCount.style.color = "#828282";
  modalTitleElementCount.style.fontSize = "14px";
  modalTitleElementCount.innerHTML =
    contentToShowInModal?.RatedSkills?.length + " " + "elements selected";
  headerContent.appendChild(modalTitleElementCount);
  // Create the main content of modal
  const modalContentMainParent = document.createElement("div");
  modalContentMainParent.id = "modalContentMainParent";
  modalContentMainParent.style.height = "427px";
  modalContentMainParent.style.overflow = "auto";
  // Clear existing content
  modalContentMainParent.innerHTML = "";

  for (const obj of contentToShowInModal.RatedSkills) {
    const ratingGet = obj?.isot_file.ratings[0]?.rating_scale_label;
    const modalContentParent = document.createElement("div");
    modalContentParent.id = `modalContentParent-${obj?.isot_file.path_addr}`;
    modalContentParent.setAttribute(
      "class",
      `modalContentParent-${obj?.id ? obj.id : obj?.isot_file.path_addr}`
    );

    modalContentParent.style.display = "flex";
    modalContentParent.style.justifyContent = "space-between";
    modalContentParent.style.border = "1px solid #E6E6E6";
    modalContentParent.style.padding = "12px";
    modalContentParent.style.borderRadius = "4px";
    modalContentParent.style.margin = "15px 0px";

    const modalLeftContent = document.createElement("div");
    modalLeftContent.id = "modalLeftContent";
    modalLeftContent.style.width = "80%";

    const modalLeftFirstContent = document.createElement("span");
    modalLeftFirstContent.id = "modalLeftFirstContent";
    modalLeftFirstContent.innerHTML = obj?.isot_file.name;
    modalLeftFirstContent.style.fontWeight = 500;
    modalLeftFirstContent.style.fontSize = "14px";
    modalLeftFirstContent.style.color = "#828282";
    modalLeftFirstContent.setAttribute("data-label", obj?.isot_file.name);
    modalLeftContent.appendChild(modalLeftFirstContent);

    const modalLeftSecondContent = document.createElement("span");
    modalLeftSecondContent.id = "modalLeftSecondContent";
    modalLeftSecondContent.innerHTML =
      ratingGet[
        obj?.rating.length > 0 ? obj?.rating[0]?.rating - 1 : obj?.rating - 1
      ];
    modalLeftSecondContent.style.margin = "0 0 0 10px";
    modalLeftSecondContent.style.padding = "4px 12px";
    modalLeftSecondContent.style.borderRadius = "100px";
    modalLeftSecondContent.style.border = "1px solid #F2994A33";
    modalLeftSecondContent.style.fontSize = "12px";
    modalLeftSecondContent.style.fontWeight = 500;
    modalLeftContent.appendChild(modalLeftSecondContent);

    const modalRightContent = document.createElement("div");
    modalRightContent.id = "modalRightContent";
    modalRightContent.style.width = "20%";
    modalRightContent.style.textAlign = "right";

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
    modalRightSecondContent.id = `modalRightSecondContent-${
      obj?.id ? obj.id : obj?.isot_file.path_addr
    }`;
    modalRightSecondContent.style.background = "transparent";
    modalRightSecondContent.style.border = "none";
    modalRightSecondContent.style.margin = "0px 0px 0px 10px";
    modalRightSecondContent.innerHTML =
      '<i class="fa fa-trash" style="color:red"></i>';

    modalRightSecondContent.addEventListener("click", () => {
      const userSkillDetail = sortRatingByLocalStorage();
      delete_skill(obj?.id ? obj.id : obj?.isot_file.path_addr, "modal");
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
      if (!isLoginUser) {
        document.getElementById(
          `modalContentParent-${obj?.isot_file.path_addr}`
        ).style.display = "none";
      }
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
    const accordionElement = document.querySelector(
      ".accordion.accordion-true"
    );

    // Check if the element is found
    if (accordionElement) {
      // Update the class to "accordion accordion-false"
      accordionElement.click();
    }
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

async function createDropdown() {
  const dropdown = document.createElement("select");
  dropdown.style.width = "100%";
  dropdown.style.padding = "13px";
  dropdown.style.border = "1px solid #E6E6E6";
  dropdown.style.borderRadius = "4px";
  dropdown.style.marginBottom = "10px";
  dropdown.style.background = "white";
  dropdown.style.fontSize = "1em";
  dropdown.style.appearance = "none";
  dropdown.style.display = "none"; 

  // Add default option
  const defaultOption = document.createElement("option");
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.value = "";
  defaultOption.text = "Select Category";
  dropdown.appendChild(defaultOption);

  // Predefined selected category IDs
  const selectedCategoryIds = ["tags/2", "tags/3", "tags/4", "tags/11", "tags/16"];

  try {
    const response = await fetch(`${ENDPOINT_URL}categories`);
    const categories = await response.json();

    let selectedTag = "tags/11"; 

    // Filter categories by selectedCategoryIds and populate the dropdown
    categories
      .filter(category => selectedCategoryIds.includes(category._id)) // Filter only selected categories
      .forEach(category => {
        const option = document.createElement("option");
        option.value = category._id;
        option.textContent = category.title;
        dropdown.appendChild(option);
        if (category._id === selectedTag) {
          option.selected = true;
        }
      });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

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

function transformDataFromLocalStorage(originalData) {
  const loginUser = JSON.parse(localStorage.getItem("loginUserDetail"));
  const userId = loginUser?.id;

  const transformedData = {
    userId: userId || null,
    skills: []
  };
  originalData?.forEach((skill) => {
    const { isot_file_id, rating } = skill;
    if (!isot_file_id) return;

    transformedData.skills.push({
      path_addr: isot_file_id,
      ratings: rating ? rating : [],
    });
  });

  console.warn("transformedData", transformedData);
  return transformedData;
}

function addTolocalStorage(userRatedSkill) {
  // Get the existing list from local storage
  const storageKey = isLoginUser ? "logginUserRatedSkills" : "userRatedSkills";

  const existingList = JSON.parse(
    localStorage.getItem(storageKey) || "[]"
  );

  // Find the index of the userRatedSkill if it exists
  const index = existingList.findIndex((existingItem) => {
    if (isLoginUser) {
      if(existingItem.isot_file_id) {
        return existingItem.isot_file_id === userRatedSkill.isot_file_id;
      }
      else if( existingItem.isot_path_addr) {
        return existingItem.isot_path_addr === userRatedSkill.isot_file_id;
      }
    } else {
      return existingItem.isot_file_id === userRatedSkill.isot_file_id;
    }
  });

  if (index !== -1) {
    // If the skill already exists, update it in place
    existingList[index] = userRatedSkill;
  } else {
    // If the skill doesn't exist, add it to the list
    existingList.push(userRatedSkill);
  }

  // Save the updated list back to localStorage
  localStorage.setItem(storageKey, JSON.stringify(existingList));
}

function getListFromlocalStorage() {
  if(isLoginUser){
      if (localStorage.getItem("userRatedSkills")) {
          return JSON.parse(localStorage.getItem("userRatedSkills"));
      } else if (localStorage.getItem("logginUserRatedSkills")) {
          return JSON.parse(localStorage.getItem("logginUserRatedSkills"));
      } else {
          return [];
      }
  }
  else{
    if (localStorage.getItem("sampleUserRatedSkills")) {
        return JSON.parse(localStorage.getItem("sampleUserRatedSkills"));
    } 
    else if(localStorage.getItem("userRatedSkills")) {
        return JSON.parse(localStorage.getItem("userRatedSkills"));
    }
    else{
        return [];
    }
  } 
}

function getLoggedInUserListFromlocalStorage() {
  if (localStorage.getItem("logginUserRatedSkills")) {
    return JSON.parse(localStorage.getItem("logginUserRatedSkills"));
  } else {
    return [];
  }
}

async function getListFromLoggedInUser(loaderIdentifier) {
  const getElementByClass = document.querySelector(".elementCountLabel");
  const previousContent = getElementByClass.innerHTML;
  const overlay = document.createElement("div");
  if (loaderIdentifier !== "notLoadded") {
    // Create and append the loader
    overlay.id = "global-loader";
    overlay.innerHTML = `<div class="loader-spinner"></div>`;
    document.body.appendChild(overlay);
  }
  if (getAccessToken) {
    try {
      let response = [];
      response = await fetch(loggedInUserApiEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken.access}`,
        },
      });
      if (!response.ok && response.status === 401) {
        //throw new Error(`HTTP error! Status: ${response.status}`);
        const refreshtoken = JSON.parse(
          localStorage.getItem("tokenData")
        )?.refresh;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
          refresh: refreshtoken,
        });
        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
        };
        try {
          fetch(getaccessYokenEndpoint, requestOptions)
            .then((response) => response.text())
            .then(async (result) => {
              localStorage.setItem(
                "tokenData",
                JSON.stringify({
                  refresh: refreshtoken,
                  access: JSON.parse(result)?.access,
                })
              );
              const Retreyresponse = await fetch(loggedInUserApiEndpoint, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${JSON.parse(result)?.access}`,
                },
              });
              const data = await Retreyresponse.json();
              if (loaderIdentifier !== "notLoadded") {
                document.body.removeChild(overlay);
                getElementByClass.innerHTML = previousContent;
              }
              localStorage.setItem(
                "logginUserRatedSkills",
                JSON.stringify(data.data)
              );
              createSelectedSkillsCount();
              return data;
            })
            .catch((error) => console.log("error", error));
        } catch (error) {
          console.log("Error occurred:", error);
        }
      } else {
        const data = await response.json();
        if (loaderIdentifier !== "notLoadded") {
          document.body.removeChild(overlay);
          getElementByClass.innerHTML = previousContent;
        }
        localStorage.setItem(
          "logginUserRatedSkills",
          JSON.stringify(data.data)
        );
        createSelectedSkillsCount();
        return data;
      }
    } catch (error) {
      if (loaderIdentifier !== "notLoadded") {
        document.body.removeChild(overlay);
        getElementByClass.innerHTML = previousContent;
      }
      console.error("Error occurred:", error);
      return { error: error.message };
    }
  } else {
    if (loaderIdentifier !== "notLoadded") {
      document.body.removeChild(overlay);
      getElementByClass.innerHTML = previousContent;
    }
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
  if (localStorage.getItem("userRatedSkills")) {
    localStorage.removeItem("userRatedSkills");
  }
}

function clearloggedlocalStorage() {
  if (localStorage.getItem("logginUserRatedSkills")) {
    localStorage.removeItem("logginUserRatedSkills");
  }
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
  const getResetModalContainer = document.querySelector(".modal-container");

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
      getResetModalContainer.style.display = "flex";
      // Open the modal when the button is clicked
      const confirmModal = document.getElementById("confirmModal");
      confirmModal.style.display = "block";
      confirmModal.style.borderRadius = "5px";
      confirmModal.style.padding = "20px";
      confirmModal.style.width = "80%";
      confirmModal.style.maxWidth = "400px";
      confirmModal.style.background = "white";

      // Handle modal close button
      const closeModalButton = document.getElementById("closeModal");
      closeModalButton.onclick = function () {
        getResetModalContainer.style.display = "none";
        confirmModal.style.display = "none";
      };

      // Handle reset confirmation
      const confirmResetButton = document.getElementById("confirmReset");
      confirmResetButton.onclick = function () {
        getResetModalContainer.style.display = "none";
        htmlElement.disabled = true;
        htmlElement.style.border = "";
        htmlElement.style.color = "";
        const elements = document.querySelectorAll('[id^="selectedRating-"]');
        const plusOneBtnElements =
          document.querySelectorAll('[id^="plusOneBtn"]');
        elements.forEach((element) => {
          element.style.display = "none";
        });

        plusOneBtnElements.forEach((element) => {
          element.style.display = "none";
        });

        const accordionElement = document.querySelector(
          ".accordion.accordion-true"
        );
        if (accordionElement) {
          accordionElement.click();
        }

        clearlocalStorage();
        createSelectedSkillsCount();

        // Close the modal
        confirmModal.style.display = "none";
      };
    });
  }

  return htmlElement;
}

// Function to handle API calling for  "Add Skill" button click
function addSkillToApi(payload) {
  // API endpoint (replace with your actual API endpoint)
  const apiEndpoint = `https://lambdaapi.iysskillstech.com/latest/dev-api/add-skill`;
  // Make the API call using the fetch API
  return fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add any additional headers if needed
    },
    body: JSON.stringify(payload)
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
      return data;
    })
    .catch((error) => {
      toastr.error("Skill element not added");
      throw error;
    });
}

function delete_skill(skill_id, deleteIconIdentifier) {
  let getElementByIdData;
  if (isLoginUser) {
    if (deleteIconIdentifier !== "modal") {
      getElementByIdData = document.getElementById(
        `cross-btn-child-${skill_id}`
      );
    } else {
      getElementByIdData = document.getElementById(
        `modalRightSecondContent-${skill_id}`
      );
    }

    const previousContent = getElementByIdData.innerHTML;
    // Create and append the loader
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.id = "small-loader-for-content";
    loader.style.width = "15px";
    loader.style.height = "15px";
    loader.style.margin = "auto";
    if (deleteIconIdentifier !== "modal") {
      getElementByIdData.setAttribute("class", "");
    } else {
      getElementByIdData.innerHTML = "";
    }
    getElementByIdData.appendChild(loader);

    let url = `${deleteSkillApiEndpoint}${skill_id}/`;

    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken?.access}`,
      },
    })
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "limit-exceeded.html";
        } else {
          return response.json();
        }
      })
      .then(async (response) => {
        if (isLoginUser) {
          await getListFromLoggedInUser("notLoadded", getElementByIdData);
          if (deleteIconIdentifier === "modal") {
            getElementByIdData.removeChild(loader);
          }
          getElementByIdData.innerHTML = previousContent;

          const ratingModalElementCount = document.getElementById(
            "rating-modal-element-count"
          );
          const getAttributeValue =
            ratingModalElementCount.getAttribute("data-count") - 1;
          ratingModalElementCount.innerHTML =
            getAttributeValue + " " + "elements selected";
          ratingModalElementCount.setAttribute("data-count", getAttributeValue);
          if (getAttributeValue === 0) {
            document.getElementById("closeModal").click();
          }
          document.querySelector(
            `.modalContentParent-${skill_id}`
          ).style.display = "none";
        }
        const deleteRowData = document.getElementById("modalLeftFirstContent");
        if (deleteRowData) {
          const SelectedRowData = deleteRowData.getAttribute("data-label");

          toastr.success(`Remove Skill ${SelectedRowData} from profile`);
        }
        displaySelctedSkills();
        createSelectedSkillsCount();
      })
      .catch((err) => {
        console.error(err);
        if (isLoginUser) {
          if (deleteIconIdentifier === "modal") {
            getElementByIdData.removeChild(loader);
          }
          getElementByIdData.innerHTML = previousContent;
        }
      });
  } else {
    removeItemFromlocalStorage(skill_id);
    toastr.success(`Remove selected skill`);
    displaySelctedSkills();
    createSelectedSkillsCount();
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
    this.skillSelected = false;
    if (typeof config == "object") {
      this.options = {
        ...this.options,
        ...config,
      };
    }
    this.searchTimeout = null;
    this.currentRequest = null; 
  }
  //initi fuctions
  init() {
    this.createSearchBox();
    this.setupCreateSearchTriggers();
  }
  createSearchBox() {
    const div = document.createElement("div");
    div.classList.add("input-group", "input-group-lg");
    div.style.display = "flex";
    div.style.flexDirection = "row";
    div.style.borderRadius = "10px";

    const input = document.createElement("input");
    this.searchInputBox = input;
    input.id = "plugin-search-id";
    input.classList.add("form-control");
    input.autocomplete = "off";
    input.setAttribute("aria-label", "Sizing example input");
    input.setAttribute(
      "placeholder",
      "Search Profile / Skill / Technology / Domain / Activity"
    );
    input.setAttribute("aria-describedby", "inputGroup-sizing-lg");
    input.type = "search";
    input.style.background = `transparent url("${imagePath}Group 3.svg")`;
    input.style.backgroundRepeat = "no-repeat";
    input.style.backgroundPositionX = "calc(100% - 13px)";
    input.style.backgroundPositionY = "center";

    // Responsive icon size
    if (window.innerWidth < 768) {
      input.style.backgroundSize = "1rem";
    } else {
      input.style.backgroundSize = "1.4rem";
    }

  
    div.appendChild(input);

    // Create the clear icon
    const clearIcon = document.createElement("span");

    clearIcon.id = "plugin-search-id-close-button";
    clearIcon.innerHTML = "&times;";
    clearIcon.style.cursor = "pointer";
    clearIcon.style.width = "2rem";
    clearIcon.style.height = "2rem";
    clearIcon.style.borderRadius = "50%";
    clearIcon.style.color = "red";
    clearIcon.style.backgroundColor = "green";
    clearIcon.style.display = "flex";
    clearIcon.style.alignItems = "center";
    clearIcon.style.justifyContent = "center";
    clearIcon.style.textAlign = "center";
    clearIcon.style.fontSize = "30px";
    clearIcon.style.lineHeight = "1";
    clearIcon.style.display = "none";

    // Create a container for the input and clear icon
    const inputContainer = document.createElement("div");
    inputContainer.style.position = "relative";
    inputContainer.style.flex = "1"; // Take up remaining space in the flex container
    div.appendChild(inputContainer);

    // Append the input and clear icon to the container
    inputContainer.appendChild(input);

    // Add click event to clear the input field
    clearIcon.addEventListener("click", () => {
      this.skillSelected = false;
      input.value = "";
      divDropDown.style.display = "none";
      button.style.display = "block";
      this.selectedASkillBox.style.display = "none";
      clearIcon.style.display = "none"; // Hide the clear icon after clearing input
    });

    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-label-container";
    categoryHeader.id = "category-header";
    categoryHeader.style.display = "none";
    categoryHeader.style.margin = "0 0.5rem";

    // // Create the heading
    var categoryHeading = document.createElement("label");
    categoryHeading.textContent = "Select Categories";
    categoryHeading.style.display = "block";
    categoryHeading.style.fontFamily = "Inter, sans-serif";
    categoryHeading.style.fontWeight = "600";
    categoryHeading.style.fontStyle = "Semi Bold";
    categoryHeader.appendChild(categoryHeading);
    categoryHeading.style.fontSize = "1.1rem";


    // // Create the label
    var rateHeading = document.createElement("label");
    rateHeading.textContent = "Rate selected skill";
    rateHeading.style.display = "block";
    rateHeading.style.marginTop = "-0.3rem";
    rateHeading.style.fontFamily = "Inter, sans-serif";
    rateHeading.style.fontWeight = "400";
    rateHeading.style.fontStyle = "Regular";
    categoryHeader.appendChild(rateHeading);
    rateHeading.style.fontSize = "15px";
    rateHeading.style.color = "#6D6D6D";

    this.selectedDiv.appendChild(categoryHeader)

    // Event listener to toggle search button and clear icon based on input content
    input.addEventListener("input", () => {
      const hasInput = input.value.trim() !== "";
      clearIcon.style.display = hasInput ? "block" : "none";
      const dropdownMenu = document.querySelector(".dropdown-menu");
      dropdownMenu.style.display = "none";
      divDropDown.style.display = hasInput ? "block" : "none";
      this.selectedASkillBox.style.display = hasInput ? "none" : "block";
      categoryHeader.style.display = hasInput ? "block" : "none";
    });

    // Initial check to hide search button if the input has content
    if (input.value.trim() !== "") {
      const dropdownMenu = document.querySelector(".dropdown-menu");
      dropdownMenu.style.display = "none";
      divDropDown.style.display = "none";
      this.selectedASkillBox.style.display = "none";
    }

    this.selectedDiv.appendChild(div);

    const divDropDown = document.createElement("div");
    divDropDown.id = "dropdown-plugin-div";
    divDropDown.style.flexWrap = "wrap";

    divDropDown.style.gap = "8px";
    divDropDown.style.border = "1px solid #F6F6F6";
    divDropDown.style.borderBottomLeftRadius = "1rem";
    divDropDown.style.borderBottomRightRadius = "1rem";
    divDropDown.style.margin = "0 0.5rem";
    divDropDown.style.paddingBottom = "1rem";
    divDropDown.style.display = "none";

    this.selectedDiv.appendChild(divDropDown);
    this.selectboxDiv.insertBefore(div, this.searchBox);
  }


  setupCreateSearchTriggers() {
    const searchBoxElement = document.getElementById("plugin-search-id");
    searchBoxElement.addEventListener("input", (event) => {
      if (this.skillSelected) {
        searchBoxElement.value = ""; // Clear search box
        this.searchValue = "";
        this.skillSelected = false;
        document.getElementById("dropdown-plugin-div").style.display = "none";
      }

      else{
        event.preventDefault();
        this.isFromSelectBox = false;
        this.searchValue = searchBoxElement.value;
        if (this.searchValue?.length > 0) {
          clearTimeout(this.searchTimeout);
          this.searchTimeout = setTimeout(() => {
            this.searchAPI(this.searchValue);
          }, 300);
        }
      }
    });
  }

  getSkillName(skillObject) {
    return skillObject.term;
  }

  deleteSelectedSkill(skillListId) {
    this.selectedSkills.splice(skillListId, 1);
    this.createSelectedSkillList();
  }

  createSelectedSkillList() {
    const div = document.getElementById(this.selectedSkilldiv);
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

  createSkillSearchList(searchResultsList, searchText, selectedValue) {
    const div = document.getElementById("dropdown-plugin-div");
    div.innerHTML = "";

    this.searchResultsList = searchResultsList;
    if (searchResultsList.length > 0) {
      let autoClicked = false;

      for (let i = 0; i < searchResultsList.length; i++) {
        const pill = document.createElement("div");
        pill.className = "skill-pill";
        pill.style.alignItems = "center";
        pill.style.padding = "0.625rem 0.75rem";
        pill.style.backgroundColor = "rgb(255, 255, 255)";
        pill.style.color = "rgb(79, 79, 79)";
        pill.style.fontSize = "0.875rem";
        pill.style.fontWeight = "500";
        pill.style.cursor = "pointer";
        pill.style.transition = "background-color 0.2s";
        pill.style.paddingLeft = "2rem";
        pill.style.borderBottom = "1px solid #F6F6F6";
    
        const skillName = document.createElement("span");
        skillName.id = "skill-name";
        skillName.style.display = "inline-flex";
        skillName.style.alignItems = "center";
        skillName.style.gap = "0.6rem"; 
        skillName.innerHTML = "";
        const arrowIcon = document.createElement("i");
        arrowIcon.className = "fa-solid fa-chevron-right";
        arrowIcon.style.fontSize = "0.438rem";
        const folderIcon = document.createElement("i");
        if (searchResultsList[i].skills[0].child_count > 0) {
            folderIcon.className = "fa-solid fa-folder";
            folderIcon.innerHTML = ""; 
            skillName.appendChild(arrowIcon); 
          } else {
            folderIcon.className = ""; 
            folderIcon.innerHTML = `<img src="${imagePath}file.png" alt="file image" />`;
          }
        folderIcon.style.color = "#f4c542";
        folderIcon.style.fontSize = "12px";
        const text = document.createTextNode(searchResultsList[i].term);
        skillName.appendChild(folderIcon);
        skillName.appendChild(text);
        pill.appendChild(skillName);


        pill.addEventListener("click", (event) => {
          const categoryHeader = document.getElementById("category-header");
          categoryHeader.style.display = "none";
          this.skillSelected = true;
          this.skillClick(i, selectedValue);
          div.style.display = "none";
          this.selectedASkillBox.style.display = "block";
        });

        const skillNameGet = this.getSkillName(searchResultsList[i]);
        if (this.isFromSelectBox && !autoClicked && skillNameGet.trim() === searchText.trim()) {
          pill.click(); // Trigger click event
          autoClicked = true; // Prevent multiple clicks
        }

        div.appendChild(pill);
      }

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
  async openAddSkillModal(searchText) {
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

    // Create the dropdown (select element)
    const dropdown = await createDropdown();

    // Create error messages
    const emailError = createErrorMessage();
    emailFieldContainer.appendChild(emailError);

    const elementError = createErrorMessage();
    elementFieldContainer.appendChild(elementError);

    const categoryError = createErrorMessage();

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
      // const selectedCategory = dropdown.value;
      const selectedCategoryId = dropdown.value;
      const selectedCategoryText = dropdown.options[dropdown.selectedIndex]?.text;

      const reqData = {
        name: elementValue,
        cat: selectedCategoryText,
        cat_id:selectedCategoryId,
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
      if (selectedCategoryId === "") {
        displayErrorMessage(categoryError, "Category is required");
      } else {
        hideErrorMessage(categoryError);
      }

      // Check if any error exists
      if (
        emailValue === "" ||
        elementValue === "" ||
        selectedCategoryId === "" ||
        emailError.textContent !== ""
      ) {
        return; // Do not proceed if there are errors
      }

      // Call the API function with the payload
      addSkillToApi(reqData)
        .then((data) => {
          // Optionally, you can close the modal or perform other actions
          modalDiv.style.display = "none";
          showSkillAddedNotification(reqData.name);
        })
        .catch((error) => {
          // Handle errors, show an alert, or perform other actions
        });
    });

    modalContent.appendChild(modalButton);

    // Append the modal to the document body
    let pluginDiv = document.getElementById(this.options.pluginDivId);

    if (pluginDiv) {
      pluginDiv.appendChild(modalDiv);
    } else {
      console.error(`Element with ID ${this.options.pluginDivId} not found.`);
    }

    function showSkillAddedNotification(skillName) {
      let notificationDiv = document.getElementById("skill-notification");
  
      if (!notificationDiv) {
          notificationDiv = document.createElement("div");
          notificationDiv.id = "skill-notification";
          notificationDiv.style.position = "fixed";
          notificationDiv.style.top = "32%";
          notificationDiv.style.left = "50%";
          notificationDiv.style.transform = "translate(-50%, -50%)";
          notificationDiv.style.background = "#4CAF50";
          notificationDiv.style.color = "#fff";
          notificationDiv.style.padding = "15px 25px";
          notificationDiv.style.borderRadius = "8px";
          notificationDiv.style.textAlign = "center";
          notificationDiv.style.fontSize = "16px";
          notificationDiv.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
          notificationDiv.style.zIndex = "10000";
          notificationDiv.style.fontFamily = "system-ui";
          notificationDiv.style.display = "flex";
          notificationDiv.style.alignItems = "center";
          notificationDiv.style.justifyContent = "space-between";
          notificationDiv.style.minWidth = "350px";
          notificationDiv.style.gap = "10px";
  
          // Create the text content
          let messageSpan = document.createElement("span");
          messageSpan.textContent = `The skill "${skillName}" has been added successfully. Kindly search to add this skill.`;
  
          // Create the close button
          let closeButton = document.createElement("button");
          closeButton.innerHTML = "&times;";
          closeButton.style.background = "none";
          closeButton.style.border = "none";
          closeButton.style.color = "#fff";
          closeButton.style.fontSize = "20px";
          closeButton.style.fontWeight="bold";
          closeButton.style.cursor = "pointer";
          closeButton.style.marginLeft = "10px";
  
          // Close notification when button is clicked
          closeButton.onclick = function () {
              notificationDiv.style.display = "none";
              notificationDiv.remove();
          };
  
          // Append elements
          notificationDiv.appendChild(messageSpan);
          notificationDiv.appendChild(closeButton);
  
          if (pluginDiv) {
            pluginDiv.appendChild(notificationDiv);
          } else {
            document.body.appendChild(notificationDiv);
          }
      }
  
      notificationDiv.style.display = "flex";
  
      let timeout = setTimeout(() => {
          if (document.body.contains(notificationDiv)) {
              notificationDiv.style.display = "none";
              notificationDiv.remove();
          }
      }, 5000);
  
      closeButton.onclick = function () {
          clearTimeout(timeout);
          notificationDiv.style.display = "none";
          notificationDiv.remove();
      };
    }  
    
    function createInputContainer(labelText) {
      const container = document.createElement("div");
      container.style.position = "relative";
      modalContent.appendChild(container);

      const label = createLabel(labelText);
      container.appendChild(label);

      return container;
    }
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  searchHighlight(searched, text) {
    if (searched !== "") {
      const searchTerms = searched
        .split(" ")
        .map((term) => this.escapeRegExp(term));
      const newText = text.replace(
        new RegExp(searchTerms.join("|"), "gi"),
        (match) => `<b>${match}</b>`
      );
      return newText;
    }
    return text;
  }

  searchAPI(searchValue,selectedValue,skillId) {
    if (this.currentRequest) {
      this.currentRequest.abort(); // Cancel previous request
    }

    this.currentRequest = new AbortController(); // Create new controller
    const signal = this.currentRequest.signal;

    this.searchInputBox.type = "text";

    const div = document.getElementById("dropdown-plugin-div");

    const loader = document.createElement("div");
    loader.className = "loader";

    div.innerHTML = "";
    div.appendChild(loader);

    const cardBodySearch = document.querySelector(".card-body-search");
    cardBodySearch.style.display = "block";


    const encodedSearchValue = encodeURIComponent(this.searchValue.trim());
    let apiUrl = `${ENDPOINT_URL}?q=${encodedSearchValue}&limit=10`;
    if (skillId) {
        apiUrl += `&path=${skillId}`;
    }

    if(selectedValue){
      this.isFromSelectBox = true;
    }

    if (isLoginUser && this.searchValue.length > 0) {
      let authApiUrl = `https://api.myskillsplus.com/api-search/?q=${encodedSearchValue}`;
      if (skillId) {
        authApiUrl += `&path=${skillId}`;
      }
      fetch(authApiUrl,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken?.access}`,
          },
          signal,
        }
      )
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "limit-exceeded.html";
          } else {
            return response.json();
          }
        })
        .then((response) => {
            this.createSkillSearchList(response.matches, this.searchValue, selectedValue);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        })
        .finally(() => {
          div.removeChild(loader);
        });
    } else if (this.searchValue.trim().length > 0) {
      fetch(apiUrl,{signal})
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "limit-exceeded.html";
          } else {
            return response.json();
          }
        })
        .then((response) => {
            this.createSkillSearchList(
              response.matches,
              this.searchValue.trim(),
              selectedValue
            );
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        })
        .finally(() => {
          div.removeChild(loader);
        });
    } else {
      this.createSkillSearchList([], this.searchValue, selectedValue);
    }
  }
}
class IysFunctionalAreasPlugin extends IysSearchPlugin {
  constructor(config) {
    super(config);
    this.skillPlayground = document.getElementById(this.skillPlayground);

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
    if (this.options.skillsData) {
      // replace with local storage
      localStorage.setItem(
        "userRatedSkills",
        JSON.stringify(this.options.skillsData)
      );
    }

    this.fillStarImageUrl =
      "https://i.ibb.co/zxrDfTN/Screenshot-from-2023-04-29-09-48-17.png";
    this.emptyStarImageUrl =
      "https://i.ibb.co/XC1pj0h/Screenshot-from-2023-04-29-09-49-11.png";

    this.ratedSelectedSkills = [];
    this.showPopup = this.showPopup.bind(this);
    this.saveTheSkillComment = this.saveTheSkillComment.bind(this);

    this.categoryLabelsContainer = null;
    this.activeFetchRequest = null;
    this.updatedBreadcrumbContainer = null
    this.updatedBreadcrumbItem = [];
    this.breadcrumbSpan = null;
    this.categoryHeadingLabel = null;
    this.categorySearchLabel = null;
    this.mainParentSkills = null;
    this.ITEMS_PER_PAGE = 10;
    this.currentPage = 1;
  }

  showPopup = (event, skillDetail) => {
    const existingPopup = document.getElementById("confirmPopup");
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement("div");
    popup.id = "confirmPopup";
    popup.style.position = "absolute";
    popup.style.width = "250px";
    popup.style.backgroundColor = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.borderRadius = "8px";
    popup.style.padding = "5px";
    popup.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    popup.style.zIndex = "1000";
    popup.style.fontSize = "14px";
    popup.style.textAlign = "center";
    popup.innerHTML = `<p>Do you want to select this skill for your profile?</p>`;

    // Create OK button
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.margin = "5px";
    okButton.style.backgroundColor = "#4CAF50";
    okButton.style.color = "white";
    okButton.style.border = "none";
    okButton.style.borderRadius = "4px";
    okButton.style.cursor = "pointer";

    okButton.addEventListener("click", () => {
        document.body.removeChild(popup);
        this.saveTheSkillComment("", "", skillDetail, ""); // ✅ Now accessible
    });

    // Create Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.margin = "5px";
    // cancelButton.style.padding = "5px 10px";
    cancelButton.style.backgroundColor = "#f44336";
    cancelButton.style.color = "white";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "4px";
    cancelButton.style.cursor = "pointer";
    cancelButton.addEventListener("click", () => {
        document.body.removeChild(popup);
    });

    popup.appendChild(okButton);
    popup.appendChild(cancelButton);
    document.body.appendChild(popup);

    const rect = event.target.getBoundingClientRect();
    const popupWidth = 250;
    const padding = 10;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.left + scrollX;
    let top = rect.top + scrollY - popup.offsetHeight - 10;

    // Prevent overflow to the right
    if (left + popupWidth + padding > viewportWidth) {
      left = viewportWidth - popupWidth - padding;
    }

    // Prevent popup from going above the viewport
    if (top < scrollY) {
      top = rect.bottom + scrollY + 10; // Show below the element
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;

    // Function to hide popup when clicking outside
    function hidePopupOnClickOutside(event) {
        if (!popup.contains(event.target)) {
            popup.remove();
            document.removeEventListener("click", hidePopupOnClickOutside);
        }
    }
    setTimeout(() => {
        document.addEventListener("click", hidePopupOnClickOutside);
    }, 0);
  };

  setupDiv() {
    // Create card div
    var cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.style.fontFamily = "system-ui";
    cardDiv.classList.add("no-shadow");


    // Create tab content div
    var tabContentDiv = document.createElement("div");
    tabContentDiv.className = "tab-content";
    tabContentDiv.id = "myTabContent0";

    // Create home tab pane div
    var homeTabDiv = document.createElement("div");
    homeTabDiv.className = "tab-pane fade show active";
    homeTabDiv.id = "home0";
    homeTabDiv.setAttribute("role", "tabpanel");
    homeTabDiv.setAttribute("aria-labelledby", "home-tab0");

    //New changes
    var groupSkilltypeDiv = document.createElement("div");
    groupSkilltypeDiv.className = "group-skill-type container-fluid px-md-3";

    var skillGroupDiv = document.createElement("div");
    skillGroupDiv.style =
      "margin-top:1rem; padding-right:7px; padding-left:7px; display:flex; justify-content:center; align-items:center;";

    var skillGroupNavDiv = document.createElement("div");
    skillGroupNavDiv.className = "nav nav-pills m-0";
    skillGroupNavDiv.id = "skillsTab";
    skillGroupNavDiv.style = "width:100%;";

    var skillGroupButton = document.createElement("div");
    skillGroupButton.className = "skillgroupbutton d-flex";
    skillGroupButton.setAttribute("role", "group");
    skillGroupButton.setAttribute("aria-label", "Three views");
    skillGroupButton.style =
      "padding-right: 6px; padding-left:6px; padding-top:2px; padding-bottom:2px; width:100%;";


    // Create the select box container
    var selectboxDiv = document.createElement("div");
    selectboxDiv.className = "selectbox-container";
    selectboxDiv.style.position = "relative";
    selectboxDiv.style.fontFamily = "system-ui";
    selectboxDiv.style.width = "100%";

     // Create the heading
    var headingLabel = document.createElement("label");
    headingLabel.textContent = "Skills Profiler";
    headingLabel.className = "skills-profiler-heading"
    selectboxDiv.appendChild(headingLabel);

    // Create the label
    var searchLabel = document.createElement("label");
    searchLabel.textContent = "Rate selected skill";
    searchLabel.className = "skills-profiler-subheading";
    selectboxDiv.appendChild(searchLabel);

    // Create the search box
    let debounceTimer;
    let activeFetchRequest = null;

    // Create the dropdown menu container
    var dropdownMenu = document.createElement("div");
    dropdownMenu.id = "skills-horizontal-menu";
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.style.borderRadius = "0";
    dropdownMenu.style.boxShadow = "none";
    dropdownMenu.style.width = "100%";

    var skillsContainerWrapper = document.createElement("div");

    this.categoryLabelsContainer = document.createElement("div");
    this.categoryLabelsContainer.className = "category-label-container";
    this.categoryLabelsContainer.style.display = "block";
    this.categoryLabelsContainer.style.margin = "0 1.5rem";

    skillsContainerWrapper.appendChild(this.categoryLabelsContainer);

    // Breadcrumb container
    var breadcrumbContainer = document.createElement("div");
    breadcrumbContainer.id = "breadcrumb-container";
    breadcrumbContainer.style.display = "none";
    breadcrumbContainer.style.alignItems = "center";
    breadcrumbContainer.style.flexWrap = "wrap";
    breadcrumbContainer.style.margin = "0 1.5rem";
    breadcrumbContainer.style.gap = "5px";
    skillsContainerWrapper.appendChild(breadcrumbContainer);

    // Create the heading
    this.categoryHeadingLabel = document.createElement("label");
    this.categoryHeadingLabel.textContent = "Select Categories";
    this.categoryHeadingLabel.className = "select-categories-heading";
    this.categoryLabelsContainer.appendChild(this.categoryHeadingLabel);


    // Create the label
    this.categorySearchLabel = document.createElement("label");
    this.categorySearchLabel.textContent = "Rate selected skill";
    this.categorySearchLabel.className = "select-categories-subheading"
    this.categoryLabelsContainer.appendChild(this.categorySearchLabel);


    // Create the skills container (horizontal layout)
    var skillsContainer = document.createElement("div");
    skillsContainer.id = "skills-container";
    skillsContainer.style.flexWrap = "wrap";
    skillsContainer.style.gap = "8px";
    skillsContainer.style.margin = "0 1.5rem";
    skillsContainer.style.border = "1px solid #F6F6F6";
    skillsContainer.style.borderBottomLeftRadius = "1rem";
    skillsContainer.style.borderBottomRightRadius = "1rem";
    skillsContainer.style.paddingBottom = "1rem";
    skillsContainer.id = "skills-container";
    skillsContainerWrapper.appendChild(skillsContainer);
    dropdownMenu.appendChild(skillsContainerWrapper);


   // Loading indicator
    var loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loader";
    loadingIndicator.id = "loading-indicator";
    dropdownMenu.appendChild(loadingIndicator);

    homeTabDiv.appendChild(dropdownMenu)

    const searchBox = document.createElement("div");
    searchBox.className = "wrapper-group-div";

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const style = document.createElement("style");

    style.textContent = `

    .skills-profiler-heading{
      display: block;
      font-family: "Inter", sans-serif;
      font-weight: 500;
      font-size: 1.25rem;
    }

    .skills-profiler-subheading,
    .select-categories-subheading{
      display: block;
      margin-bottom: 1rem;
      font-family: "Inter", sans-serif;
      font-weight: 400;
      font-size: 0.938rem;
      color: #6D6D6D;
    }
    
    .wrapper {
      height: 2.7rem;
      background-color: #FDFDFD;
      border-radius: 5rem;
    }

    .wrapper-group-div{
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 2.7rem;
      margin-bottom: 1rem;
    }

    .tabs {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 15px;
      background-color: #FDFDFD;
      border-radius: 5rem;
      border: 1px solid #F2F2F2;
    }

    .tabs button {
      padding: 0.625rem 0.938rem;
      border: none;
      border-radius: 5rem;
      background: transparent;
      font-family: "Inter" sans-serif;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
      color: #3A3A3A;
      position: relative;
    }

    .tabs button.active {
      color: #3F5AF7;
      background-color: #EFF6FF;
      border: 1px solid #C3CCFD;
      font-weight: 600;
    }

    .element-div-profile-link{
      width: 5.75rem;
      height: 2.7rem;
      border: none;
      background: linear-gradient(135deg, #A3CEFF, #3F5AF7);
      border-radius: 3rem;
      color: white;
      font-size: 0.9rem;
      font-family: "Inter" sans-serif;
      font-weight: 600;
    }

    #plugin-search-id{
      font-size: 0.938rem;
      font-family: "Inter" sans-serif;
      font-weight: 400;
      height: auto;
      border-radius: 10px;
      padding: 10px 1.25rem;
      padding-right: 0;
      margin-bottom: 1rem;
    }

    .category-label-container{
      background-color: #FAFAFA;
      display: flex;
      align-items: center;
      padding: 10px;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      padding-left: 1.3rem;
    }

    .select-categories-heading{
      display: block;
      font-size: 1.1rem;
      font-family: "Inter" sans-serif;
      font-weight: 600;
    }

    .breadcrumb-path-text{
      padding: 1rem;
      font-family: "Inter" sans-serif;
      font-weight: 500;
      font-size: 0.9rem;
      color: rgb(79, 79, 79);
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
    }

    .breadcrumb-path-labels{
      margin: 0.2rem 0.938rem;
      margin-bottom: 0;
      font-family: "Inter" sans-serif;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .back-btn{
      font-size: 0.7rem;
      font-family: "Inter" sans-serif;
      width: 4.5rem;
      height: 2rem;
      border-radius: 1rem;
      padding: 5px 16px;
      color: #414141;
      background-color: #fff;
      border: 1px solid #F2F2F2;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
      
    .accordion-header{
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      height: 2.75rem;
      align-items: center;
      background-color: #F6F6F6;
      border: 1px solid #E9EAEB;
      border-bottom: none;
      padding: 10px;
      padding-left: 1.3rem;
    }

    .category-heading-label{
      display: "block";
      font-family: "Inter" sans-serif;
      font-weight: 600;
      font-style: Semi Bold;
      font-size: 0.8rem;
      color: #717680;
      width: 40rem;
    }


    .accordion-collapse{
      border: 1px solid #E9EAEB;   
      border-bottom: none;                
    }

    .accordion-item{
      border:none;
    }

    .accordion-item:first-child,
    .accordion-item:first-child > .accordion-header{
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
    }

    .accordion-item:last-child > .accordion-collapse{
      border-bottom: 1px solid #E9EAEB;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    #pagination{
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
      border: 1px solid #E9EAEB;
      border-top: none;
      padding: 0.5rem 1rem;
    }

    #pagination-btn-wrapper{
      display: flex;
      gap: 0.5rem;
    }

    .pagination-txt-info{
      color: #414651;
      font-weight: 600;
      font-size: 0.7rem;
    }

    .pagination-btn{
      border: 1px solid #D5D7DA;
      border-radius: 0.5rem;
      background-color: white;
      padding: 0.4rem 0.7rem;
    }

    .bg-{
      width: 100%;
      color: #181D27;
      font-weight: 500;
      font-size: 0.85rem;
      line-height: 100%;
      letter-spacing: -0.03em;
      margin-bottom: 0.3rem;
    }

    .experience-year{
      display: flex;
      gap: 0.3rem;
      font-family: "Inter", sans-serif;
      font-weight: 400;
      font-style: Regular;
      font-size: 0.75rem;
      color: #9A9A9A;
    }

    .pr-3{
      width: 12rem;
    }

    .save-profile-btn{
      border-radius: 3rem;
      font-family: "Inter", sans-serif !important;
      width: 8rem;
      height: 2.75rem;
      border: none;
      color: white;
      background-color: #3F5AF7;
      margin-top: 1rem;
      font-family: "Inter", sans-serif;
      font-weight: 600;
      font-size: 1rem;
    }

    .circle {
      display: inline-flex;        
      align-items: center;        
      justify-content: center;    
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background-color: #DDDDDD;
      border: 1px solid #9A9A9A; 
      color: #414651;
      font-size: 0.8rem;
      margin-left: 8px;           
    }

    input[type="radio"] {
      appearance: none;
      -webkit-appearance: none;

      width: 18px;
      height: 18px;
      border: 2px solid #555;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      background: white;
    }


    input[type="radio"]:checked {
      background: #007bff;      /* fill circle */
      border-color: #007bff;
    }

    input[type="radio"]:checked::after {
      content: "✓";
      position: absolute;
      color: white;              /* white tick */
      font-size: 12px;
      font-weight: bold;

      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    input[type="search"]::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
      display: none;
    }
    
    input[type="search"]::-webkit-search-decoration {
      -webkit-appearance: none;
    }

    .rating-label{
      font-size: 0.85rem;
    }

    .checkbox-label{
      font-size: 0.75rem;
    }

    .add-skill-button{
      width: 5.25rem;
      height: 2rem;
      border: none;
      background-color: #E7EBFE;
      border-radius: 5rem;
      color: #C3CCFD;
      font-size: 0.75rem;
      font-family: "Inter" sans-serif;
      font-weight: 700;
      font-style: "Bold";
      border: 1px solid #C3CCFD;
    }

    .no-shadow {
      --mdb-card-box-shadow: none;
      box-shadow: none !important;
    }

    .mobile-actions {
      display: none;
      position: absolute;
    }
    
    .menu-btn {
      border: none;
      background: transparent;
      font-size: 22px;
      cursor: pointer;
      margin-right: 1.5rem;
    }
    
    .menu-btn:hover {
      background: #e5e7eb;
    }
  
   .dropdown-menu-btn {
     position: absolute;
     top: 45px;
     right: 0;
     background: white;
     min-width: 140px;
     border-radius: 12px;
     box-shadow: 0 8px 25px rgba(0,0,0,0.15);
     overflow: hidden;
 
     opacity: 0;
     visibility: hidden;
     transform: translateY(-10px);
 
     transition: all 0.2s ease;
      z-index: 9999; 
   }
   
   .dropdown-menu-btn.show {
       opacity: 1;
       visibility: visible;
       transform: translateY(0);
   }
   
   .dropdown-menu-btn button {
       width: 100%;
       padding: 12px 15px;
       border: none;
       background: white;
       text-align: left;
       font-size: 15px;
       cursor: pointer;
       transition: 0.2s;
   }
   
   .dropdown-menu-btn button:hover {
      background: #f3f4f6;
   }

   .skill-container-append-tabular{
      gap: 1rem;
   }

  `;

    document.head.appendChild(style);

    const tabsDiv = document.createElement("div");
    tabsDiv.className = "tabs";

    const tabs = ["Browse Function/Industries", "Personal Attributes", "Language Proficiency", "Work Preferences", "Digital Skill"];

    tabs.forEach((tab, index) => {
      const tabBtn = document.createElement("button");
      tabBtn.textContent = tab;

      tabBtn.addEventListener("click", () => {
        setActiveTab(tabBtn);
        if (index===0){
          this.categoryLabelsContainer.innerHTML = "";
          this.categoryLabelsContainer.appendChild(this.categoryHeadingLabel);
          this.categoryLabelsContainer.appendChild(this.categorySearchLabel);
          this.fetchSkills("");
          this.searchInputBox.value = "";
          openHomeTab()
          const cardBodySearch = document.querySelector(".card-body-search");
          cardBodySearch.style.display = "none";
          const dropdownMenu = document.getElementById("skills-horizontal-menu");
          dropdownMenu.style.display = "block"; 
          const categoryHeader = document.getElementById("category-header");
          categoryHeader.style.display = "none";
        } else {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.updatedBreadcrumbItem = [];
            const dropdownMenu = document.getElementById("skills-horizontal-menu");
            dropdownMenu.style.display = "none";
            this.fetchSkills(tab);
            openHomeTab()
          }, 300);
        }
      });
    
      tabsDiv.appendChild(tabBtn);
      wrapper.appendChild(tabsDiv);
      searchBox.appendChild(wrapper);
      selectboxDiv.appendChild(searchBox);

      if (index === 0) {
        setActiveTab(tabBtn);
        this.fetchSkills("");
        dropdownMenu.style.display = "block"; 
      }
    });

    
    function setActiveTab(activeBtn) {
      const allTabs = tabsDiv.querySelectorAll("button");
      
      allTabs.forEach(btn => btn.classList.remove("active"));
      activeBtn.classList.add("active");
    }

    this.selectboxDiv = selectboxDiv; 
    this.searchBox = searchBox;


    var hardSkills = createSkillTabButton(
      "hard-skills",
      "#hard-skills-content",
      "fa-wand-magic-sparkles",
      "Search Skills",
      "Knowledge and Skills related to concepts, methods, processes, technologies, tools and such"
    );
    hardSkills.style.marginLeft = "15px";
   
    var softskillSelectboxDiv = document.createElement("div");
    softskillSelectboxDiv.className = "button-container";
    var selectboxButton = document.createElement("button");
    selectboxButton.style.width = "300px";
    selectboxButton.style.height = "70px";
    selectboxButton.style.borderRadius = "10px";
    selectboxButton.style.display = "flex";
    selectboxButton.style.alignItems = "center";
    selectboxButton.className ="btn nav-link";
    selectboxButton.style.paddingTop = "2.5rem";
    selectboxButton.style.paddingBottom = "2.5rem";
    selectboxButton.style.paddingLeft = "1.5rem";
    selectboxButton.style.paddingRight = "1rem";
    selectboxButton.style.boxShadow = "none";
    selectboxButton.style.color = "#1E1E1E";
    selectboxButton.style.letterSpacing = "0.5px";
    selectboxButton.style.backgroundColor = "rgb(232, 253, 252)";
    var selectBox = document.createElement("select");
    selectBox.className = "custom-select";
    selectBox.style.width = "100%";
    selectBox.style.padding = "10px";
    selectBox.style.border = "1px solid #ccc";
    selectBox.style.borderRadius = "5px";
    selectboxDiv.style.fontFamily = "system-ui";
    selectBox.style.fontSize = "15px";
    selectBox.style.backgroundColor = "rgb(232, 253, 252)";
    // Placeholder option
    var placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.style.backgroundColor ="white";
    placeholderOption.textContent = "Select Soft Skills";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectBox.prepend(placeholderOption);

    // Function to fetch and populate options
    async function fetchSoftSkills() {
        try {
            const response = await fetch("https://lambdaapi.iysskillstech.com/latest/dev-api/listout-soft-skills/");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();

            // Iterate over each term and its skills
            data.forEach(category => {
                category.skills.forEach(skill => {
                    var option = document.createElement("option");
                    option.style.backgroundColor ="white";
                    option.value = skill.name;
                    option.textContent = skill.name;
                    selectBox.appendChild(option);
                });
            });

        } catch (error) {
            console.error("Error fetching soft skills:", error);
        }
    }

    // Call API to populate select box
    fetchSoftSkills();
    selectboxButton.appendChild(selectBox);
    softskillSelectboxDiv.appendChild(selectboxButton);
    softskillSelectboxDiv.style.marginLeft="15px";

    var role = createSkillTabButton(
      "role",
      "#role-tab-content",
      "fa-wand-magic-sparkles",
      "ROLE",
      "The time spent on individual contribution, managing, leading and such"
    );
    role.style.marginLeft = "15px";

    var skillGroupDescription = document.createElement("div");
    skillGroupDescription.className = "skillgroupdescription";
    skillGroupDescription.setAttribute("role", "group");
    skillGroupDescription.setAttribute("aria-label", "Three views");
    skillGroupDescription.style =
      "display: flex; padding-right: 6px; padding-left: 6px; padding-top: 2px; padding-bottom: 2px; align-items: center; justify-content: center;";

    var arrow = document.createElement("i");
    arrow.className = "flashing-arrow fa-solid fa-arrow-left";

    var explanationText = document.createElement("span");
    explanationText.className = "explanation-text";
    explanationText.textContent =
      " Click on Hard Skills or Soft Skills to search, select and rate on skills";

    skillGroupDescription.appendChild(arrow);
    skillGroupDescription.appendChild(explanationText);

    skillGroupNavDiv.appendChild(selectboxDiv);

    skillGroupNavDiv.appendChild(skillGroupButton);
    skillGroupDiv.appendChild(skillGroupNavDiv);

    groupSkilltypeDiv.appendChild(skillGroupDiv);

    document.body.appendChild(groupSkilltypeDiv);

    //First page content image
    var imgBodyDiv = document.createElement("div");
    imgBodyDiv.className = "img-body";
    imgBodyDiv.style.display = "flex";
    imgBodyDiv.style.padding = "20px";
    imgBodyDiv.style.alignItems = "center";
    imgBodyDiv.style.justifyContent = "center";
    imgBodyDiv.style.flexDirection = "column";

    var contentImg = document.createElement("img");
    contentImg.src = `${imagePath}Group 175.svg`;
    contentImg.style.maxWidth = "906px";
    contentImg.style.width = "100%";
    contentImg.style.height = "auto";

    var contentText1 = document.createElement("span");
    contentText1.textContent =
      "EXPERIENCE THE RICHNESS OF SKILLS TAXONOMY HERE";
    contentText1.style =
      "text-align:center; color:#0050AF; font-size:25px; margin-top:10px;";

    var contentText2 = document.createElement("span");
    contentText2.textContent = "SEARCH FOR A SKILL OR OCCUPATION";
    contentText2.style = "text-align:center; color:#0050AF; font-size:25px;";

    imgBodyDiv.appendChild(contentImg);
    imgBodyDiv.appendChild(contentText1);
    imgBodyDiv.appendChild(contentText2);

    var cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body-search";

    // Create softSkillDetail div
    var softSkillDetail = document.createElement("div");
    softSkillDetail.style.padding = "15px";
    softSkillDetail.classList.add("softskillaccordian");
    softSkillDetail.style.backgroundColor = "#EFF4FA";
    softSkillDetail.style.borderRadius = "10px";
    softSkillDetail.style.height = "auto";
    softSkillDetail.style.display = "none";
    softSkillDetail.style.margin = "20px";
    softSkillDetail.style.boxShadow = "rgba(0, 0, 0, 0.1) 2px 2px 10px";
    softSkillDetail.setAttribute("id", "softskillaccordian");
    softSkillDetail.setAttribute("data-mdb-target", "#soft-skills");
    var softSkillDescriptionDiv = document.createElement("div");
    var softSkillDescriptionDiv = document.createElement("div");
    softSkillDescriptionDiv.className = "softSkillDescription";
    softSkillDescriptionDiv.style =
      "display:none; margin: 20px;border-radius: 10px; background-color: white; box-sizing: border-box; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 8px;";
    var firstLine = document.createElement("p");
    firstLine.textContent =
      "Explore the different Soft Skills and select those that you associate with most.";
    firstLine.style =
      "font-weight:500; margin:0px; padding:10px; padding-bottom:0px;";

    var secondLine = document.createElement("p");
    secondLine.textContent =
      "NOTE: Choose only those that you associate with closely. Keep the overall number of figures between 10 to 20. A large number will dilute your profile.";
    secondLine.style = "padding:10px; font-weight:300;";

    softSkillDescriptionDiv.appendChild(firstLine);
    softSkillDescriptionDiv.appendChild(secondLine);
    homeTabDiv.appendChild(softSkillDescriptionDiv);
    homeTabDiv.appendChild(softSkillDetail);

    var roleDetail = document.createElement("div");
    roleDetail.style.padding = "5px";
    roleDetail.classList.add("roleaccordian");
    roleDetail.style.backgroundColor = "#EFF4FA";
    roleDetail.style.borderRadius = "10px";
    roleDetail.style.height = "auto";
    roleDetail.style.display = "none";
    roleDetail.style.margin = "20px";
    roleDetail.style.boxShadow = "rgba(0, 0, 0, 0.1) 2px 2px 10px;";
    roleDetail.setAttribute("id", "roleaccordian");
    roleDetail.setAttribute("data-mdb-target", "#soft-skills");
    homeTabDiv.appendChild(roleDetail);

    $(document).ready(() => {
      const searchInputBox = document.getElementById("plugin-search-id");
      //Click the Category skills
      dropdownMenu.addEventListener("click", (event) => {
          const pill = event.target.closest(".skill-pill");
          if (pill) {
            const skillId = pill.getAttribute("data-path-addr");
            const skillName = pill.querySelector("span:first-child").textContent.trim();
            const hasChildren = pill.querySelector("span:last-child")?.textContent === " +";
            
            // If it's a skill with no children (leaf node)
            if (!hasChildren) {
                this.searchValue = skillName;
                if (this.searchValue && this.searchValue.trim() !== "") {
                    const encodedSearchValue = encodeURIComponent(this.searchValue.trim());
                    this.searchAPI(encodedSearchValue, encodedSearchValue, skillId);
                }
                dropdownMenu.style.display = "none";
            }
          }
      });

      document.addEventListener("click", (event) => {
        const dropdownMenu = document.getElementById("skills-horizontal-menu");
        const searchBox = document.querySelector(".search-input");
        if (
            !dropdownMenu.contains(event.target) &&
            !searchBox.contains(event.target)
        ) {
            dropdownMenu.style.display = "none";
            searchBox.value = "";
        }
      });

      //Click the softskills
      selectBox.addEventListener("change", (event) => {
        const selectedValue = selectBox.value;
        if (selectedValue) {
          searchInputBox.value = selectedValue;
          this.searchValue = selectedValue;
          if (this.searchValue && this.searchValue.trim() !== "") {
            const encodedSearchValue = encodeURIComponent(this.searchValue.trim());
            this.searchAPI(encodedSearchValue,encodedSearchValue);
          }
        }
      });
      // Bind methods to ensure 'this' context is correct
      this.handleHardSkillsClick = this.handleHardSkillsClick.bind(this);
      this.handleSoftSkillsClick = this.handleSoftSkillsClick.bind(this);
      this.handleRoleClick = this.handleRoleClick.bind(this);

      $(".hard-skills").click(this.handleHardSkillsClick);
      $(".soft-skills").click(this.handleSoftSkillsClick);
      $(".role").click(this.handleRoleClick);
    });

    var searchDiv = document.createElement("div");
    searchDiv.id = "serachid";
  
    var elementCountLabelDiv = document.createElement("div");
    elementCountLabelDiv.className = "elementCountLabel";
    elementCountLabelDiv.style.display = "flex";
    elementCountLabelDiv.style.justifyContent = "flex-end";
    var tabContentDiv2 = document.createElement("div");
    tabContentDiv2.className = "tab-content";
    tabContentDiv2.id = "pills-tabContent";
    var skillPlaygroundDiv = document.createElement("div");
    skillPlaygroundDiv.id = "skillPlayground";
    var replaceholderDiv = document.createElement("div");
    replaceholderDiv.id = "replaceholder";

    tabContentDiv2.appendChild(skillPlaygroundDiv);
    tabContentDiv2.appendChild(replaceholderDiv);

    selectboxDiv.appendChild(searchDiv);
    searchBox.appendChild(elementCountLabelDiv);
    cardBodyDiv.appendChild(tabContentDiv2);
    homeTabDiv.appendChild(cardBodyDiv);

    // Append home tab pane div to tab content div
    tabContentDiv.appendChild(homeTabDiv);

    // Create profile tab pane div
    var profileTabDiv = document.createElement("div");
    profileTabDiv.className = "tab-pane fade container-fluid profile-tab";
    profileTabDiv.id = "profile0";
    profileTabDiv.setAttribute("role", "tabpanel");
    profileTabDiv.setAttribute("aria-labelledby", "profile-tab0");
   
    if (iysplugin.tap === "profile") {
      profileTabDiv.classList.add("show", "active");
      homeTabDiv.classList.remove("show", "active");
    }

    var containerFluidDiv = document.createElement("div");
    containerFluidDiv.className = "container-fluid custom-container";
    containerFluidDiv.style.display = "flex";
    containerFluidDiv.style.flexDirection = "column";
    containerFluidDiv.style.justifyContent = "flex-start";
    containerFluidDiv.style.alignItems = "center";
    containerFluidDiv.style.marginTop = "-1.5rem";
    containerFluidDiv.style.marginBottom = "1rem";
   
    var mb4mt3Div = document.createElement("div");
    mb4mt3Div.className = "mb-4 profile-header";
   
    var container = document.createElement("div");
    container.className = "flex-container";

    var skillRateInformationDiv = document.createElement("div");
    skillRateInformationDiv.className = "skillRateInformation";
    skillRateInformationDiv.style = "margin: 20px auto; padding: 10px 0px 10px 10px; border-radius: 30px; width: 100%; font-family: system-ui; text-align: left; font-size: 16px;";
    skillRateInformationDiv.style.border = "0.4px solid #E1F7E9";
    skillRateInformationDiv.style.background = "#E1F7E9";
   
    skillRateInformationDiv.innerHTML = `<div class="element-count-content-div" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div style="display: flex; align-items: center;">
          <div style="margin-left: 10px;">
            <span style="font-size:16px; color:#28a745;">To add proficiencies in <strong>Skills</strong> click</span>
          </div>
          <div style="display: flex; justify-content: center; align-items: center;">
            <i class="fas fa-star" style="font-size: 22px; margin-left:8px; color:#ccccff;"></i>
          </div>
        </div>
        <a class="element-div-home-link" id='home-link' href="#" onclick="openHomeTab()" style="margin-right:20px; font-size:16px; color:#46419C; text-decoration: underline;">Back to Select Skills</a>
      </div>`;
    
    mb4mt3Div.appendChild(container);
    
    var my3Div = document.createElement("div");
    my3Div.className = "custom-box";
    var navPillsDiv = document.createElement("div");
    navPillsDiv.className = "nav nav-pills view-skill-profile m-0";
    navPillsDiv.id = "viewsTab";
    navPillsDiv.style = "display:inline-block;";

    var btnGroupDiv = document.createElement("div");
    btnGroupDiv.className = "d-none";
    btnGroupDiv.setAttribute("aria-label", "Three views");
    btnGroupDiv.style =
      "padding: 1px; box-shadow:none !important; border-bottom:2px solid #E9EDF1;";

    var quickTabButton = createTabButton(
      "quick-tab",
      "#quick-tab-content",
      `${imagePath}Group 28.svg`,
      "Quick View"
    );
    var tabularTabButton = createTabButton(
      "tabular-tab",
      "#tabular-tab-content",
      `${imagePath}Group 29.svg`,
      "Tabular View"
    );

    if (iysplugin.profile_view == "quick") {
      btnGroupDiv.appendChild(quickTabButton);
    } else if (iysplugin.profile_view == "tablular") {
      btnGroupDiv.appendChild(tabularTabButton);
    } else if (iysplugin.profile_view == "all") {
      btnGroupDiv.appendChild(quickTabButton);
      btnGroupDiv.appendChild(tabularTabButton);
    }

    navPillsDiv.appendChild(btnGroupDiv);

    my3Div.appendChild(navPillsDiv);

    var tabContentDiv3 = document.createElement("div");
    tabContentDiv3.className = "tab-content card custom-tab-content";
    tabContentDiv3.id = "viewsTabContent0";
    tabContentDiv3.style = "box-shadow:none;";

    var quickTabContentDiv = document.createElement("div");
    quickTabContentDiv.className = "tab-pane fade";
    quickTabContentDiv.id = "quick-tab-content";
    quickTabContentDiv.setAttribute("role", "tabpanel");
    quickTabContentDiv.setAttribute("aria-labelledby", "home-tab0");

    var h5QuickView = document.createElement("p");
    h5QuickView.className = "h5";
    h5QuickView.textContent = "Quick View";
    h5QuickView.style = "color:#0050AF; font-size:18px;";
    var pQuickView = document.createElement("p");
    pQuickView.className = "p-0 m-0";
    pQuickView.textContent =
      "Presents your skills, proficiencies, and notes on the skills. Easy to know what all skills you have";
    pQuickView.style = "color:#636363;";
    var quickViewContentDiv = document.createElement("div");
    quickViewContentDiv.id = "quickViewContentDiv";

    quickTabContentDiv.appendChild(h5QuickView);
    quickTabContentDiv.appendChild(pQuickView);
    quickTabContentDiv.appendChild(quickViewContentDiv);

    var tabularTabContentDiv = document.createElement("div");
    tabularTabContentDiv.className = "tab-pane fade show active";
    tabularTabContentDiv.id = "tabular-tab-content";
    tabularTabContentDiv.setAttribute("role", "tabpanel");
    tabularTabContentDiv.setAttribute("aria-labelledby", "profile-tab0");

    var h5TabularView = document.createElement("p");
    h5TabularView.className = "h5";
    h5TabularView.textContent = "Tabular View";
    var pTabularView = document.createElement("p");
    pTabularView.className = "p-0 m-0";
    pTabularView.textContent =
      "Presents your skills in a logical and organized way, like that in our report cards in school.";
    var brElement = document.createElement("br");
    var tabularViewContentViewDiv = document.createElement("div");
    tabularViewContentViewDiv.id = "tabularViewContentView";


    var accordionDiv = document.createElement("div");
    accordionDiv.className = "accordion d-none";
    accordionDiv.id = "accordionPanelsStayOpenExample";
    var accordionItemDiv = document.createElement("div");
    accordionItemDiv.className = "accordion-item";
    var accordionButton = document.createElement("button");
    accordionButton.setAttribute("data-mdb-collapse-init", "");
    accordionButton.className = "accordion-button";
    accordionButton.type = "button";
    accordionButton.setAttribute("data-mdb-toggle", "collapse");
    accordionButton.setAttribute(
      "data-mdb-target",
      "#panelsStayOpen-collapseOne"
    );
    accordionButton.setAttribute("aria-expanded", "true");
    accordionButton.setAttribute("aria-controls", "panelsStayOpen-collapseOne");
    accordionButton.style = "background-color: #eff5ff";

    accordionItemDiv.appendChild(accordionButton);
    accordionDiv.appendChild(accordionItemDiv);

    tabularTabContentDiv.appendChild(tabularViewContentViewDiv);
    tabularTabContentDiv.appendChild(accordionDiv);

    tabContentDiv3.appendChild(quickTabContentDiv);
    tabContentDiv3.appendChild(tabularTabContentDiv);

    containerFluidDiv.appendChild(mb4mt3Div);
    containerFluidDiv.appendChild(my3Div);
    navPillsDiv.appendChild(tabContentDiv3);

    profileTabDiv.appendChild(containerFluidDiv);

    tabContentDiv.appendChild(profileTabDiv);

    // Create modal div
    var modalDiv = document.createElement("div");
    modalDiv.className = "modal top fade";
    modalDiv.id = "RateSkillModel";
    modalDiv.tabIndex = "-1";
    modalDiv.setAttribute("aria-labelledby", "RateSkillModelLabel");
    modalDiv.setAttribute("aria-hidden", "true");
    modalDiv.setAttribute("data-mdb-backdrop", "true");
    modalDiv.setAttribute("data-mdb-keyboard", "true");

    // Create modal dialog div
    var modalDialogDiv = document.createElement("div");
    modalDialogDiv.className = "modal-dialog modal-xl modal-dialog-centered";

    // Create modal content div
    var modalContentDiv = document.createElement("div");
    modalContentDiv.className = "modal-content";

    // Create modal header div
    var modalHeaderDiv = document.createElement("div");
    modalHeaderDiv.className = "modal-header";
    modalHeaderDiv.style = "padding:15px; background-color:#EFF4FA";

    // Create modal title paragraph
    var modalTitleParagraph = document.createElement("p");
    modalTitleParagraph.className = "modal-title";
    modalTitleParagraph.id = "RateSkillModelLabel";
    modalTitleParagraph.textContent = "Modal title";

    // Create close button
    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-close";
    closeButton.setAttribute("data-mdb-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");

    // Append modal title and close button to modal header
    modalHeaderDiv.appendChild(modalTitleParagraph);
    modalHeaderDiv.appendChild(closeButton);

    // Create modal body div
    var modalBodyDiv = document.createElement("div");
    modalBodyDiv.className = "modal-body";
    modalBodyDiv.style = "padding:30px;";

    // Create span element for star
    var spanElementForStar = document.createElement("div");
    spanElementForStar.id = "spanElementForStar";
    spanElementForStar.style.marginLeft = "0px";
    spanElementForStar.style.marginRight = "0px";

    // Create label for "Remark"
    var remarkLabel = document.createElement("label");
    remarkLabel.className = "fw-bold";
    remarkLabel.style = "margin-top:15px; margin-bottom:10px;";
    remarkLabel.textContent = "Remark";

    // Create form outline div
    var formOutlineDiv = document.createElement("div");
    formOutlineDiv.className = "form-outline";
    formOutlineDiv.style = "border: 2px solid #E9EDF1";

    // Create textarea for "rateSkillCommentBox"
    var rateSkillCommentBoxTextarea = document.createElement("textarea");
    rateSkillCommentBoxTextarea.className = "form-control form-control-lg";
    rateSkillCommentBoxTextarea.id = "rateSkillCommentBox";
    rateSkillCommentBoxTextarea.rows = "4";
    rateSkillCommentBoxTextarea.setAttribute("data-mdb-showcounter", "true");
    rateSkillCommentBoxTextarea.maxLength = "100";
    rateSkillCommentBoxTextarea.placeholder = "Enter Remark (20-100 characters)";

    // Create label for "rateSkillCommentBox"
    var rateSkillCommentBoxLabel = document.createElement("label");
    rateSkillCommentBoxLabel.className = "form-label";
    rateSkillCommentBoxLabel.setAttribute("for", "rateSkillCommentBox");

    // Create form helper div
    var formHelperDiv = document.createElement("div");
    formHelperDiv.className = "form-helper";

    // Append textarea, label, and form helper to form outline div
    formOutlineDiv.appendChild(rateSkillCommentBoxTextarea);
    formOutlineDiv.appendChild(rateSkillCommentBoxLabel);
    formOutlineDiv.appendChild(formHelperDiv);

    // Append elements to modal body
    modalBodyDiv.appendChild(spanElementForStar);
    modalBodyDiv.appendChild(remarkLabel);
    modalBodyDiv.appendChild(formOutlineDiv);

    // Create modal footer div
    var modalFooterDiv = document.createElement("div");
    modalFooterDiv.className = "modal-footer";
    modalFooterDiv.style = "padding:20px;";

    // Create span element for save button
    var spanElementForSaveButton = document.createElement("span");
    spanElementForSaveButton.id = "spanElementForSaveButton";

    // Append span element to modal footer
    modalFooterDiv.appendChild(spanElementForSaveButton);

    // Append modal header, body, and footer to modal content
    modalContentDiv.appendChild(modalHeaderDiv);
    modalContentDiv.appendChild(modalBodyDiv);
    modalContentDiv.appendChild(modalFooterDiv);

    // Append modal content to modal dialog
    modalDialogDiv.appendChild(modalContentDiv);

    // Append modal dialog to modal div
    modalDiv.appendChild(modalDialogDiv);

    // Append modal div to document body
    cardDiv.appendChild(modalDiv);
    cardDiv.appendChild(tabContentDiv);


    // Create modal container div
    var resetModalContainer = document.createElement("div");
    resetModalContainer.id = "resetModalContainer";
    resetModalContainer.className = "modal-container";

    // Create modal content div
    var confirmModal = document.createElement("div");
    confirmModal.id = "confirmModal";
    confirmModal.className = "modal-content";

    // Create reset title div
    var resetTitleDiv = document.createElement("div");
    resetTitleDiv.className = "reset-title";

    // Create reset title paragraph
    var resetTitleParagraph = document.createElement("p");
    resetTitleParagraph.textContent = "Reset Confirm";

    // Create close button
    var closeModalSpan = document.createElement("span");
    closeModalSpan.id = "closeModal";
    closeModalSpan.className = "close-button";
    closeModalSpan.innerHTML = "&times;";

    // Append title paragraph and close button to reset title div
    resetTitleDiv.appendChild(resetTitleParagraph);
    resetTitleDiv.appendChild(closeModalSpan);

    // Create HR line
    var resetHrLine = document.createElement("hr");
    resetHrLine.className = "reset-hr-line";

    // Create reset message paragraph
    var resetMessageParagraph = document.createElement("p");
    resetMessageParagraph.className = "reset-message";
    resetMessageParagraph.textContent = "Are you sure you want to reset?";

    // Create confirm button
    var confirmResetButton = document.createElement("button");
    confirmResetButton.id = "confirmReset";
    confirmResetButton.className = "confirm-button";
    confirmResetButton.textContent = "Confirm";

    // Append elements to modal content div
    confirmModal.appendChild(resetTitleDiv);
    confirmModal.appendChild(resetHrLine);
    confirmModal.appendChild(resetMessageParagraph);
    confirmModal.appendChild(confirmResetButton);

    // Append modal content to modal container div
    resetModalContainer.appendChild(confirmModal);

    // Append modal container div to document body
    cardDiv.appendChild(resetModalContainer);

    // Create modal div
    var modalDiv = document.createElement("div");
    modalDiv.className = "modal top fade show active";
    modalDiv.id = "RateSkillModel";
    modalDiv.tabIndex = "-1";
    modalDiv.setAttribute("aria-labelledby", "RateSkillModelLabel");
    modalDiv.setAttribute("aria-hidden", "true");
    modalDiv.setAttribute("data-mdb-backdrop", "true");
    modalDiv.setAttribute("data-mdb-keyboard", "true");

    // Create modal dialog div
    var modalDialogDiv = document.createElement("div");
    modalDialogDiv.className = "modal-dialog modal-xl modal-dialog-centered";

    // Create modal content div
    var modalContentDiv = document.createElement("div");
    modalContentDiv.className = "modal-content";

    // Create modal header div
    var modalHeaderDiv = document.createElement("div");
    modalHeaderDiv.className = "modal-header";

    // Create modal title paragraph
    var modalTitleParagraph = document.createElement("p");
    modalTitleParagraph.className = "modal-title";
    modalTitleParagraph.id = "RateSkillModelLabel";
    modalTitleParagraph.textContent = "Modal title";

    // Create close button
    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-close";
    closeButton.setAttribute("data-mdb-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");
    closeButton.id = "RateSkillModelBtn";

    // Append modal title and close button to modal header
    modalHeaderDiv.appendChild(modalTitleParagraph);
    modalHeaderDiv.appendChild(closeButton);

    // Create modal body div
    var modalBodyDiv = document.createElement("div");
    modalBodyDiv.className = "modal-body";

    // Create span element for star
    var spanElementForStar = document.createElement("div");
    spanElementForStar.id = "spanElementForStar";
    spanElementForStar.style.marginLeft = "0px";
    spanElementForStar.style.marginRight = "0px";

    // Create label for "Remark"
    var remarkLabel = document.createElement("label");
    remarkLabel.className = "fw-bold";
    remarkLabel.textContent = "Remark";
    remarkLabel.style.marginBottom = "5px";
    remarkLabel.style.marginTop = "5px";

    // Create form outline div
    var formOutlineDiv = document.createElement("div");
    formOutlineDiv.className = "form-outline";

    // Create textarea for "rateSkillCommentBox"
    var rateSkillCommentBoxTextarea = document.createElement("textarea");
    rateSkillCommentBoxTextarea.className = "form-control form-control-lg";
    rateSkillCommentBoxTextarea.id = "rateSkillCommentBox";
    rateSkillCommentBoxTextarea.rows = "4";
    rateSkillCommentBoxTextarea.setAttribute("data-mdb-showcounter", "true");
    rateSkillCommentBoxTextarea.maxLength = "100";

    // Create label for "rateSkillCommentBox"
    var rateSkillCommentBoxLabel = document.createElement("label");
    rateSkillCommentBoxLabel.className = "form-label";
    rateSkillCommentBoxLabel.setAttribute("for", "rateSkillCommentBox");
    rateSkillCommentBoxLabel.textContent = "Enter Remark (20-100 characters)";

    // Create form helper div
    var formHelperDiv = document.createElement("div");
    formHelperDiv.className = "form-helper";

    // Append textarea, label, and form helper to form outline div
    formOutlineDiv.appendChild(rateSkillCommentBoxTextarea);
    formOutlineDiv.appendChild(rateSkillCommentBoxLabel);
    formOutlineDiv.appendChild(formHelperDiv);

    // Append elements to modal body
    modalBodyDiv.appendChild(spanElementForStar);
    modalBodyDiv.appendChild(remarkLabel);
    modalBodyDiv.appendChild(formOutlineDiv);

    // Create modal footer div
    var modalFooterDiv = document.createElement("div");
    modalFooterDiv.className = "modal-footer";

    // Create span element for save button
    var spanElementForSaveButton = document.createElement("span");
    spanElementForSaveButton.id = "spanElementForSaveButton";

    // Append span element to modal footer
    modalFooterDiv.appendChild(spanElementForSaveButton);

    // Append modal header, body, and footer to modal content
    modalContentDiv.appendChild(modalHeaderDiv);
    modalContentDiv.appendChild(modalBodyDiv);
    modalContentDiv.appendChild(modalFooterDiv);

    // Append modal content to modal dialog
    modalDialogDiv.appendChild(modalContentDiv);

    // Append modal dialog to modal div
    modalDiv.appendChild(modalDialogDiv);

    // Append modal div to document body
    cardDiv.appendChild(modalDiv);

    // Create tab pane div
    var tabPaneDiv = document.createElement("div");
    tabPaneDiv.className = "tab-pane fade";
    tabPaneDiv.id = "profile0";
    tabPaneDiv.style.display = "none";
    tabPaneDiv.setAttribute("role", "tabpanel");
    tabPaneDiv.setAttribute("aria-labelledby", "profile-tab0");

    // Create container fluid div
    var containerFluidDiv = document.createElement("div");
    containerFluidDiv.className = "container-fluid px-md-3 pb-md-3";

    // Create heading and description div
    var headingDescriptionDiv = document.createElement("div");
    headingDescriptionDiv.className = "mb-4 mt-3";

    // Create heading paragraph
    var headingParagraph = document.createElement("p");
    headingParagraph.className = "h3";
    headingParagraph.textContent = "Skill Profile";

    // Create description paragraph
    var descriptionParagraph = document.createElement("p");
    descriptionParagraph.className = "p-0 m-0";
    descriptionParagraph.textContent = "You have skills added to your profile.";

    // Append heading and description paragraphs to their parent div
    headingDescriptionDiv.appendChild(headingParagraph);
    headingDescriptionDiv.appendChild(descriptionParagraph);

    // Create navigation tab div
    var navTabDiv = document.createElement("div");
    navTabDiv.className = "my-3";

    // Create nav pills div
    var navPillsDiv = document.createElement("div");
    navPillsDiv.className = "nav nav-pills m-0";
    navPillsDiv.id = "viewsTab";
    navPillsDiv.setAttribute("role", "tablist");

    // Create btn group div
    var btnGroupDiv = document.createElement("div");
    btnGroupDiv.className = "btn-group border";
    btnGroupDiv.setAttribute("role", "group");
    btnGroupDiv.setAttribute("aria-label", "Three views");
    btnGroupDiv.style.padding = "1px";

    // Create quick view button
    var quickTabButton = document.createElement("button");
    quickTabButton.setAttribute("data-mdb-tab-init", "");
    quickTabButton.className = "p-3 btn nav-link active";
    quickTabButton.id = "quick-tab";
    quickTabButton.setAttribute("data-mdb-target", "#quick-tab-content");
    quickTabButton.type = "button";
    quickTabButton.setAttribute("role", "tab");
    quickTabButton.setAttribute("aria-controls", "home");
    quickTabButton.setAttribute("aria-selected", "true");
    quickTabButton.setAttribute("data-mdb-ripple-init", "true");
    quickTabButton.innerHTML =
      '<i class="fa fa-wand-magic-sparkles me-1"></i> Quick View';

    // Create tabular view button
    var tabularTabButton = document.createElement("button");
    tabularTabButton.setAttribute("data-mdb-tab-init", "");
    tabularTabButton.className = "p-3 btn nav-link";
    tabularTabButton.id = "tabular-tab";
    tabularTabButton.setAttribute("data-mdb-target", "#tabular-tab-content");
    tabularTabButton.type = "button";
    tabularTabButton.setAttribute("role", "tab");
    tabularTabButton.setAttribute("aria-controls", "profile");
    tabularTabButton.setAttribute("aria-selected", "false");
    tabularTabButton.setAttribute("data-mdb-ripple-init", "true");
    tabularTabButton.innerHTML =
      '<i class="fa fa-table me-1"></i> Tabular View';

    // Append quick view and tabular view buttons to btn group div
    btnGroupDiv.appendChild(quickTabButton);
    btnGroupDiv.appendChild(tabularTabButton);

    // Append btn group div to nav pills div
    navPillsDiv.appendChild(btnGroupDiv);

    // Append nav pills div to nav tab div
    navTabDiv.appendChild(navPillsDiv);

    // Create tab content div
    var tabContentDiv = document.createElement("div");
    tabContentDiv.className = "tab-content card shadow border p-3";
    tabContentDiv.id = "viewsTabContent0";

    // Create quick view content div
    var quickViewContentDiv = document.createElement("div");
    quickViewContentDiv.id = "quickViewContentDiv";

    // Create tabular view content div
    var tabularViewContentViewDiv = document.createElement("div");
    tabularViewContentViewDiv.id = "tabularViewContentView";


    // Create quick view tab pane div
    var quickViewTabPaneDiv = document.createElement("div");
    quickViewTabPaneDiv.className = "tab-pane fade show active";
    quickViewTabPaneDiv.id = "quick-tab-content";
    quickViewTabPaneDiv.setAttribute("role", "tabpanel");
    quickViewTabPaneDiv.setAttribute("aria-labelledby", "home-tab0");

    // Create quick view content heading
    var quickViewHeading = document.createElement("p");
    quickViewHeading.className = "h5";
    quickViewHeading.textContent = "Quick View";

    // Create quick view content description
    var quickViewDescription = document.createElement("p");
    quickViewDescription.className = "p-0 m-0";
    quickViewDescription.textContent =
      "Presents your skills, proficiencies, and notes on the skills. Easy to know what all skills you have";

    // Append quick view heading, description, and content div to quick view tab pane div
    quickViewTabPaneDiv.appendChild(quickViewHeading);
    quickViewTabPaneDiv.appendChild(quickViewDescription);
    quickViewTabPaneDiv.appendChild(quickViewContentDiv);

    // Create tabular view tab pane div
    var tabularViewTabPaneDiv = document.createElement("div");
    tabularViewTabPaneDiv.className = "tab-pane fade";
    tabularViewTabPaneDiv.id = "tabular-tab-content";
    tabularViewTabPaneDiv.setAttribute("role", "tabpanel");
    tabularViewTabPaneDiv.setAttribute("aria-labelledby", "profile-tab0");

    // Create tabular view content heading
    var tabularViewHeading = document.createElement("p");
    tabularViewHeading.className = "h5";
    tabularViewHeading.textContent = "Tabular View";
    tabularViewHeading.style = "color:#0050AF !important";

    // Create tabular view content description
    var tabularViewDescription = document.createElement("p");
    tabularViewDescription.className = "p-0 m-0";
    tabularViewDescription.textContent =
      "Presents your skills in a logical and organized way, like that in our report cards in school.";
    tabularViewDescription.style = "color:#636363 !important";

    // Create br element
    var brElement = document.createElement("br");

    // Create accordion div
    var accordionDiv = document.createElement("div");
    accordionDiv.className = "accordion d-none";
    accordionDiv.id = "accordionPanelsStayOpenExample";

    // Create accordion item div
    var accordionItemDiv = document.createElement("div");
    accordionItemDiv.className = "accordion-item";

    // Create accordion button
    var accordionButton = document.createElement("button");
    accordionButton.setAttribute("data-mdb-collapse-init", "");
    accordionButton.className = "accordion-button";
    accordionButton.type = "button";
    accordionButton.setAttribute("data-mdb-toggle", "collapse");
    accordionButton.setAttribute(
      "data-mdb-target",
      "#panelsStayOpen-collapseOne"
    );
    accordionButton.setAttribute("aria-expanded", "true");
    accordionButton.setAttribute("aria-controls", "panelsStayOpen-collapseOne");

    // Append accordion button to accordion item div
    accordionItemDiv.appendChild(accordionButton);

    // Append accordion item div to accordion div
    accordionDiv.appendChild(accordionItemDiv);

    // Append tabular view heading, description, br element, tabular view content div, accordion div, and content div to tabular view tab pane div
    tabularViewTabPaneDiv.appendChild(tabularViewHeading);
    tabularViewTabPaneDiv.appendChild(tabularViewDescription);
    tabularViewTabPaneDiv.appendChild(brElement);
    tabularViewTabPaneDiv.appendChild(tabularViewContentViewDiv);
    tabularViewTabPaneDiv.appendChild(accordionDiv);

    // Append quick view and tabular view tab panes to tab content div
    tabContentDiv.appendChild(quickViewTabPaneDiv);
    tabContentDiv.appendChild(tabularViewTabPaneDiv);

    // Append heading and description div, nav tab div, tab content div to container fluid div
    containerFluidDiv.appendChild(headingDescriptionDiv);
    containerFluidDiv.appendChild(navTabDiv);

    // Append container fluid div to tab pane div
    tabPaneDiv.appendChild(containerFluidDiv);

    // Append tab pane div to document body
    cardDiv.appendChild(tabPaneDiv);

    document.body.appendChild(cardDiv);

    // Function to create tab button
    function createTabButton(id, dataTarget, iconClass, labelText) {
      var button = document.createElement("button");
      button.setAttribute("data-mdb-tab-init", "");

      if (id == "quick-tab") {
        button.className = "px-3 py-2 btn active";
      } else {
        button.className = "px-3 py-2 btn";
      }

      button.id = id;
      button.setAttribute("data-mdb-target", dataTarget);
      button.type = "button";
      button.style = "box-shadow:none;";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "home");
      button.setAttribute("aria-selected", "true");
      var iconElement = document.createElement("img");
      iconElement.src = iconClass;
      iconElement.className = "me-1";
      button.appendChild(iconElement);
      button.innerHTML += labelText;
      return button;
    }

    function createSkillTabButton(
      id,
      dataTarget,
      iconClass,
      labelText,
      tooltipText
    ) {
      var buttonContainer = document.createElement("div");
      buttonContainer.className =
        "button-container responsive-button-container";
      var button = document.createElement("button");
      button.style.width = "200px";
      button.style.height = "70px";
      button.style.borderRadius = "10px";
      button.style.display = "flex";
      button.style.alignItems = "center";
      button.className = id + " btn nav-link responsive-button";
      button.style.paddingTop = "2.5rem";
      button.style.paddingBottom = "2.5rem";
      button.style.paddingLeft = "1.5rem";
      button.style.paddingRight = "1rem";
      button.style.boxShadow = "none";
      button.style.fontFamily = "system-ui";
      button.style.color = "#1E1E1E";
      button.style.letterSpacing = "0.5px";
      button.style.fontSize = "15px";
      button.style.textTransform = "none";
      //Image contains the button style
      var iconDiv = document.createElement("button");
      iconDiv.style.width = "40px";
      iconDiv.style.height = "40px";
      iconDiv.style.justifyContent = "center";
      iconDiv.style.border = "none";
      iconDiv.style.borderRadius = "6px";
      iconDiv.className = "d-flex me-2";
      iconDiv.fontWeight = "bold";
      //image style
      var iconElement = document.createElement("img");
      iconElement.style.padding = "4px";
      iconElement.style.height = "37px";
      iconElement.style.width = "30px";
      iconElement.className = "responsive-icon-element";

      if (id == "hard-skills") {
        button.style.backgroundColor = "#F4F3FF";
        iconDiv.style.backgroundColor = "#635BFF";
        iconElement.src = `${imagePath}Group 5.svg`;
        iconElement.alt = "img";
      } else if (id == "soft-skills") {
        button.style.backgroundColor = "#E8FDFC";
        iconDiv.style.backgroundColor = "#14E9E2";
        iconElement.src = `${imagePath}Group 7.svg`;
        iconElement.alt = "img";
      } else {
        button.style.backgroundColor = "#FFEEF3";
        iconDiv.style.backgroundColor = "#FF6692";
        iconElement.src = `${imagePath}Group 8.svg`;
        iconElement.alt = "img";
      }

      button.id = id;
      button.type = "button";
      iconDiv.appendChild(iconElement);
      button.appendChild(iconDiv);
      button.innerHTML += labelText;

      var tooltip = document.createElement("div");
      tooltip.className = "tooltipskills";
      tooltip.innerHTML = tooltipText;

      buttonContainer.appendChild(button);
      buttonContainer.appendChild(tooltip);

      buttonContainer.addEventListener("mouseover", () => {
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
      });

      buttonContainer.addEventListener("mouseout", () => {
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
      });

      return buttonContainer;
    }

    this.updateProfileData();
  }

  async init() {
    this.setupDiv();
    this.selectedDiv = document.getElementById("serachid");
    this.selectedSkillDiv = document.getElementById("selectSkill");

    this.skillPlayground = document.getElementById("skillPlayground");
    if (isLoginUser) {
      //  For rating saved
      const transformSkillList = transformDataFromLocalStorage(
        getListFromlocalStorage()
      );

      if (transformSkillList?.skills?.length > 0) {
        fetch(loggedInUserAddSkill, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken.access}`,
          },
          body: JSON.stringify(transformSkillList),
        }).then(async (response) => {
          // Handle the response from the server
          if (response.ok) {
            // Successful response
            clearlocalStorage();
            await getListFromLoggedInUser();
            this.updateProfileData();
          } else {
            // Handle errors
            console.error(
              "Failed to add skill:",
              response.status,
              response.statusText
            );
          }
        });
      } else {
        await getListFromLoggedInUser();
        this.updateProfileData();
      }
    }
    createSelectedSkillsCount();
    this.createSearchBox();
    this.setupCreateSearchTriggers();
    this.createPlayground();
    this.createRateSelectedSkills(this.skillPlayground);
    // Automatically search for a job role from localStorage
    const searchSkill = localStorage.getItem("searchSkill");
    if (searchSkill) {
        if (searchSkill && typeof this.searchAPI === "function") {
            this.searchValue = searchSkill;
            this.searchAPI(searchSkill,searchSkill);
        }
    }
  }

  // Function to create a breadcrumb item
    createBreadcrumbItem(skill, isLast = false) {
        
      const pillWrapper = document.createElement("div");
        pillWrapper.style.display = "flex";
        pillWrapper.style.justifyContent = "space-between";
        pillWrapper.style.borderLeft = "1px solid #F6F6F6";
        pillWrapper.style.borderRight = "1px solid #F6F6F6";

        const pillDiv = document.createElement("div");

        pillWrapper.appendChild(pillDiv);

        this.breadcrumbSpan = document.createElement("span");
        this.breadcrumbSpan.id = "breadcrumb-item";
        this.breadcrumbSpan.className = "breadcrumb-path-text";
        this.breadcrumbSpan.innerHTML = "";
        const arrowIcon = document.createElement("i");
        arrowIcon.className = "fa-solid fa-chevron-right";
        arrowIcon.style.fontSize = "0.438rem";
        arrowIcon.style.rotate = "90deg";
        const folderIcon = document.createElement("i");
        folderIcon.className = "fa-solid fa-folder";
        folderIcon.style.color = "#f4c542";
        folderIcon.style.fontSize = "12px";
        const text = document.createTextNode(skill.name);
        this.breadcrumbSpan.appendChild(arrowIcon); 
        this.breadcrumbSpan.appendChild(folderIcon);
        this.breadcrumbSpan.appendChild(text);

        pillDiv.appendChild(this.breadcrumbSpan);

        const ratingboxContainer = document.createElement("div");

        const ratingsCount = skill.ratings ? skill.ratings.length : 0;

        const buttonContentDiv = document.createElement("div");
        buttonContentDiv.setAttribute("id", skill.path_addr + "div");
        buttonContentDiv.style =
          "display:flex; align-items:center; justify-content:center;";
    
        if (ratingsCount > 0) {
          const searchText = searchByName(skill.name, skill.path_addr);
          if (searchText.length > 0) {

              let ratingLabel = "";
              let percentage = 0;
              let showCalendarIcon = false;
              const storageKey = isLoginUser ? "logginUserRatedSkills" : "userRatedSkills";
              const storedSkills = JSON.parse(localStorage.getItem(storageKey) || "[]");
              const matchedSkill = storedSkills.find(s => s.isot_file_id === skill.path_addr);
      
              if (matchedSkill?.isot_file?.ratings?.length) {
                  let ratingIndex = matchedSkill.rating.length === 2 ? 1 : 0;
                  const ratingValue = matchedSkill.rating[ratingIndex]?.rating;
                  const ratingScale = matchedSkill.isot_file?.ratings?.[ratingIndex]?.rating_scale_label || [];
                  const isCertification = matchedSkill.isot_file.tags?.some(tag => tag.title === "Certifications");
      
                  if (isCertification && matchedSkill.isot_file.ratings[ratingIndex].rating_scale_type === "Two Choice Rating") {
                      percentage = (ratingValue === 1) ? 100 : 0;
                  } else {
                      const ratingScaleLength = ratingScale.length;
                      if (ratingScaleLength > 0) {
                          percentage = ((ratingValue - 1) / ratingScaleLength) * 100;
                      }
                  }
               }

              // ======= Create doughnut image =======
              const ratingDetails = document.createElement("div");
              ratingDetails.className = "px-2 rating-details";
              if (percentage === 25) {
                  const image25 = document.createElement("img");
                  image25.src = imagePath + "firstRing.png";
                  image25.style.width = "25px";
                  image25.style.height = "25px";
                  ratingDetails.appendChild(image25);
              }
              if (percentage === 50) {
                  const image50 = document.createElement("img");
                  image50.src = imagePath + "secondRing.png";
                  image50.style.width = "25px";
                  image50.style.height = "25px";
                  ratingDetails.appendChild(image50);
              }
              if (percentage === 75) {
                  const image75 = document.createElement("img");
                  image75.src = imagePath + "thirdRing.png";
                  image75.style.width = "25px";
                  image75.style.height = "25px";
                  ratingDetails.appendChild(image75);
              }
              if (percentage === 100) {
                  const image100 = document.createElement("img");
                  image100.src = imagePath + "forthRing.png";
                  image100.style.width = "25px";
                  image100.style.height = "25px";
                  ratingDetails.appendChild(image100);
              }

              buttonContentDiv.appendChild(ratingDetails);
          } else {
              const starIcon = document.createElement("button");
              starIcon.className = "add-skill-button";
              starIcon.textContent = "Add Skill";
              starIcon.addEventListener("click", (event) => {
                  event.stopPropagation();
                  this.saveTheSkillComment("", "", skill, "");
                  starIcon.style.display = "none";
                    
                  document.querySelectorAll(".rating-box").forEach((box) => {
                    box.style.display = "none";
                  });

                  let ratingBox = this.createRatingBoxSearchPage(skill, "", starIcon, pillWrapper, this.breadcrumbSpan ); 
                  ratingboxContainer.innerHTML = "";
                  ratingboxContainer.appendChild(ratingBox);
                
                  ratingBox.style.display = "block";
                  
              });
              buttonContentDiv.appendChild(starIcon);
              pillDiv.appendChild(ratingboxContainer)
          }
        }

        this.breadcrumbSpan.appendChild(buttonContentDiv);
        
        return pillWrapper;
    }

    // Function to update breadcrumbs
    updateBreadcrumbs(ancestors, currentSkill) {
       const breadcrumbContainer = document.getElementById("breadcrumb-container");
        if(breadcrumbContainer){
          breadcrumbContainer.innerHTML = "";
          breadcrumbContainer.style.display = "flex";
        }
        
        // Add current skill if provided
        if (currentSkill) {
            const currentItem = this.createBreadcrumbItem(currentSkill, true);
            currentItem.style.width = "100%";
            breadcrumbContainer.appendChild(currentItem);
        }
    }

    // Function to fetch skills by path
    fetchSkillsByPath(pathAddr) {

        const dropdownMenu = document.getElementById("skills-horizontal-menu");
        if (this.activeFetchRequest) {
            this.activeFetchRequest.abort();
        }
        
        const loadingIndicator = document.getElementById("loading-indicator");
        if(loadingIndicator){
          loadingIndicator.style.display = "block";
        }

        const skillsContainer = document.getElementById("skills-container");
        if(skillsContainer){
          skillsContainer.innerHTML = "";
        }
        
        let controller = new AbortController();
        this.activeFetchRequest = controller;

        let sortedSkillsFetched = [];
        
        fetch(`https://lambdaapi.iysskillstech.com/latest/dev-api/cat-children/?path_addr=${pathAddr}&limit=200&offset=0`, 
              { signal: controller.signal })
            .then(response => response.json())
            .then(children => {
                skillsContainer.innerHTML = "";
                if (children.length === 0) return;
                
                let sortedChildren = children.sort((a, b) => {
                    let orderA = a.display_order !== null ? a.display_order : Infinity;
                    let orderB = b.display_order !== null ? b.display_order : Infinity;
                    return orderA - orderB;
                });

                sortedSkillsFetched = sortedChildren;
                
                sortedChildren.forEach(child => {
                    const pill = this.createSkillPill(child);
                    skillsContainer.appendChild(pill);
                });
                
                if(dropdownMenu){
                  dropdownMenu.style.display = "block";
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Error fetching skills:", error);
                }
            })
            .finally(() => {
                this.activeFetchRequest = null;
                const dropdownMenu = document.getElementById("skills-horizontal-menu");
                const loadingIndicator = document.getElementById("loading-indicator");
                dropdownMenu.removeChild(loadingIndicator);
            });

        return sortedSkillsFetched;
    }
    

    // Funtion to  fetchSkills
    async fetchSkills(query) {
      if (this.activeFetchRequest) {
          this.activeFetchRequest.abort();
      }
      
      const loadingIndicator = document.getElementById("loading-indicator");
      if(loadingIndicator){
        loadingIndicator.style.display = "block";
      }


      const skillsContainer = document.getElementById("skills-container");
      if(skillsContainer){
        skillsContainer.innerHTML = "";
      }


      const breadcrumbContainer = document.getElementById("breadcrumb-container");
      if(breadcrumbContainer){
        breadcrumbContainer.style.display = "none";
      }

      const dropdownMenu = document.getElementById("skills-horizontal-menu");
      
      let controller = new AbortController();
      this.activeFetchRequest = controller;
      
      const url = query 
          ? `https://lambdaapi.iysskillstech.com/latest/dev-api/search-category-skills/?q=${encodeURIComponent(query)}&limit=10`
          : `https://lambdaapi.iysskillstech.com/latest/dev-api/search-category-skills/?limit=10`;
      
      fetch(url, { signal: controller.signal })
          .then(response => response.json())
          .then(async(response) => {
              const skillsContainer = document.getElementById("skills-container");
              if(skillsContainer){
                skillsContainer.innerHTML = "";
              }
              if (response.matches.length > 0) {
                  let allSkills = [];
                  
                  response.matches.forEach(match => {
                      allSkills.push(...match.skills);
                  });
                  
                  let sortedSkills = allSkills.sort((a, b) => {
                      let orderA = a.display_order !== null ? a.display_order : Infinity;
                      let orderB = b.display_order !== null ? b.display_order : Infinity;
                      return orderA - orderB;
                  });
                  
                  // If searching, fetch paths for all matching skills first
                  if (query) {
                    document.getElementById("plugin-search-id").value = sortedSkills[0].name;
                    this.searchBox.value = sortedSkills[0].name;
                    this.searchValue = sortedSkills[0].name;
                    if (sortedSkills[0].name && sortedSkills[0].name.trim() !== "") {
                        const encodedSearchValue = encodeURIComponent(sortedSkills[0].name.trim());
                        await this.searchAPI(encodedSearchValue, encodedSearchValue, sortedSkills[0].path_addr, { isSearchCall: true });
                    }
                  } else {
                      this.mainParentSkills = [];
                      this.mainParentSkills.push(...sortedSkills);
                      sortedSkills.forEach(skill => {
                          const pill = this.createSkillPill(skill);
                          skillsContainer.appendChild(pill);
                      });
                      if(dropdownMenu){
                        dropdownMenu.style.display = "block";
                      }
                  }
                  
              } else {

              }
          })
          .catch(error => {
              if (error.name !== 'AbortError') {
                  console.error("Error fetching skills:", error);
              }
          })
          .finally(() => {
              this.activeFetchRequest = null;
              const dropdownMenu = document.getElementById("skills-horizontal-menu");
              const loadingIndicator = document.getElementById("loading-indicator");
              dropdownMenu.removeChild(loadingIndicator)
          });
    }

    // Function to createSkillPill function to handle highlighting
    createSkillPill(skill, isHighlighted = false) {
     
      const dropdownMenu = document.getElementById("skills-horizontal-menu");

      const pill = document.createElement("div");
      pill.className = "skill-pill";
      pill.setAttribute("data-path-addr", skill.path_addr);
      pill.style.alignItems = "center";
      pill.style.padding = "0.625rem 0.75rem";
      pill.style.backgroundColor = isHighlighted ? "#e6f2ff" : "rgb(255, 255, 255)";
      pill.style.color = "rgb(79, 79, 79)";
      pill.style.fontSize = "0.875rem";
      pill.style.fontWeight = "500";
      pill.style.cursor = "pointer";
      pill.style.transition = "background-color 0.2s";
      pill.style.paddingLeft = "2rem";
      pill.style.borderBottom = "1px solid #F6F6F6";
      if (isHighlighted) {
          pill.style.border = "1px solid #0066cc";
      }
  
      const skillName = document.createElement("span");
      skillName.id = "skill-name";
      skillName.style.display = "inline-flex";
      skillName.style.alignItems = "center";
      skillName.style.gap = "0.6rem"; 
      skillName.innerHTML = "";
      const arrowIcon = document.createElement("i");
      arrowIcon.className = "fa-solid fa-chevron-right";
      arrowIcon.style.fontSize = "0.438rem";
      const folderIcon = document.createElement("i");
      if (skill.child_count > 0) {
          folderIcon.className = "fa-solid fa-folder";
          folderIcon.innerHTML = ""; 
          skillName.appendChild(arrowIcon); 
        } else {
          folderIcon.className = ""; 
          folderIcon.innerHTML = `<img src="${imagePath}file.png" alt="file image" />`;
        }
      folderIcon.style.color = "#f4c542";
      folderIcon.style.fontSize = "12px";
      const text = document.createTextNode(skill.name);
      skillName.appendChild(folderIcon);
      skillName.appendChild(text);
      pill.appendChild(skillName);
      
      if (skill.child_count > 0) {
          pill.addEventListener("click", (e) => {
              e.stopPropagation();
              fetch(`https://lambdaapi.iysskillstech.com/latest/dev-api/cat-tree/?path_addr=${skill.path_addr}`)
                  .then(res => res.json())
                  .then(treeData => {
                      if (treeData.ancestors.length > 0) {
                         this.updateBreadcrumbs(treeData.ancestors, skill);
                      } else {
                          this.updateBreadcrumbs([], skill);
                      }

                      const isMain = this.mainParentSkills.some(i => i.name === skill.name);
                      const isOther = treeData.siblings.some(i => i.name === skill.name);
                      
                      const getLevel = (item) => {
                        if (this.mainParentSkills.some(i => i.name === item.name)) return 1;
                        if (treeData.siblings.some(i => i.name === item.name)) return 2;
                        return 999;
                      };
                      
                      const clickedLevel = isMain ? 1 : 2;
                      
                      let temp = this.updatedBreadcrumbItem.filter(item => {
                        return getLevel(item) <= clickedLevel;
                      });
                      
                      temp = temp.filter(item => getLevel(item) !== clickedLevel);
                      temp.push(skill);
                      this.updatedBreadcrumbItem = temp.sort((a, b) => getLevel(a) - getLevel(b));

                      this.updatedRenderBreadcrumb();
                      this.fetchSkillsByPath(skill.path_addr);
                  });
          });
      } else {
          pill.addEventListener("click", () => {
              document.getElementById("plugin-search-id").value = skill.name;
              this.searchBox.value = skill.name;
              if(dropdownMenu){
                dropdownMenu.style.display = "none";
              }
              if (skill.name && skill.name.trim() !== "") {
                  const encodedSearchValue = encodeURIComponent(skill.name.trim());
              }

              $(".hard-skills").trigger("click");
          });
      }
      
      return pill;
    }

  updatedRenderBreadcrumb() {
    this.updatedBreadcrumbContainer = document.createElement("div");
    this.updatedBreadcrumbContainer.classList.add("breadcrumb");
    this.updatedBreadcrumbContainer.style =
      "padding:10px; display:none; border-radius:5px;";

    if (this.updatedBreadcrumbItem.length > 0) {
      this.updatedBreadcrumbContainer.style.display = "";

      const backBtn = document.createElement("button");
      backBtn.style.display = "flex";
      backBtn.style.alignItems = "center";
      backBtn.style.gap = "1rem";

      // Create icon
      const icon = document.createElement("i");
      icon.className = "fa-solid fa-angle-left";
      icon.style.fontSize = "10px"

      // Create text
      const text = document.createElement("span");
      text.innerText = " Back";

      // Style button
      backBtn.className = "back-btn";

      backBtn.addEventListener("click", () => {
        this.categoryLabelsContainer.innerHTML = "";
        this.categoryLabelsContainer.appendChild(this.categoryHeadingLabel);
        this.categoryLabelsContainer.appendChild(this.categorySearchLabel);
        this.fetchSkills("");
        openHomeTab()
      });

      // Append icon + text
      backBtn.appendChild(icon);
      backBtn.appendChild(text);

      this.updatedBreadcrumbContainer.appendChild(backBtn);
    }

    // Create clickable breadcrumb items
    this.updatedBreadcrumbItem.forEach((breadcrumbItem, index) => {
      const breadcrumbLink = document.createElement("span");
      breadcrumbLink.textContent = breadcrumbItem.name;
      breadcrumbLink.className = "breadcrumb-path-labels";
      breadcrumbLink.style.color =
        index === this.updatedBreadcrumbItem.length - 1 ? "#3F5AF7" : "#6D6D6D";

      breadcrumbLink.addEventListener("click", async () => {
        const skills = this.fetchSkillsByPath(breadcrumbItem.path_addr);
        this.updatedBreadcrumbItem = this.updatedBreadcrumbItem.slice(0, index + 1);
     
        if (this.skillsContainer) {
            this.skillsContainer.innerHTML = "";
        }

        skills.forEach(child => {
            const pill = this.createSkillPill(child);
            this.skillsContainer.appendChild(pill);
        });

        this.updateBreadcrumbs([], breadcrumbItem);
        this.updatedRenderBreadcrumb();
      });

      this.updatedBreadcrumbContainer.appendChild(breadcrumbLink);

      if (index < this.updatedBreadcrumbItem.length - 1) {
        const separator = document.createElement("img");
        separator.src = `${imagePath}Group 18.svg`;
        separator.style.marginRight = "5px";
        separator.style.width = "7px"
        this.updatedBreadcrumbContainer.appendChild(separator);
      }
    });

    const currentBreadcrumbItem = this.updatedBreadcrumbItem[this.updatedBreadcrumbItem.length - 1];
    if (
      currentBreadcrumbItem &&
      currentBreadcrumbItem.ratings &&
      currentBreadcrumbItem.ratings.length > 0
    ) {
      var rateButton = document.createElement("button");
      rateButton.className = "ratebutton";
      rateButton.setAttribute("id", skills.path_addr);
      rateButton.style.marginLeft = "5px";
      rateButton.style =
        "padding-top:1px; padding-bottom: 1px; border:none; border-radius:5px;";
      rateButton.style.backgroundColor = "#E0DEFF";
      rateButton.style.cursor = "pointer";

      const rateButtonSpan = document.createElement("span");

      const searchText = searchByName(currentBreadcrumbItem.name,currentBreadcrumbItem.path_addr);
      if (searchText.length > 0) {
        rateButton.style.backgroundColor = "#E0DEFF";
        rateButtonSpan.textContent = "Rated";
        rateButtonSpan.style.color = "#1E1E1E";
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 23.svg`;
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        rateButton.appendChild(starIcon);
      } else {
        rateButton.style.backgroundColor = "#EFF4FA";
        rateButtonSpan.textContent = "Rate";
        rateButtonSpan.style.color = "#636363";
        const starIcon = document.createElement("i");
        starIcon.className = "fas fa-star";
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.style.color = "rgb(204, 204, 255)";
        rateButton.appendChild(starIcon);
      }
      rateButtonSpan.style.fontSize = "16px";
      rateButton.appendChild(rateButtonSpan);
      this.updatedBreadcrumbContainer.appendChild(rateButton);
    }

    // Append breadcrumb to accordion
    this.categoryLabelsContainer.innerHTML = "";
    this.categoryLabelsContainer.appendChild(this.updatedBreadcrumbContainer)
  }

  createPlayground() {
    this.selectedASkillBox = document.createElement("div");
    this.selectedASkillBox.classList.add("selected-skill-div");
    this.selectedASkillBox.id = "selected-skill-div";
    this.skillPlayground.appendChild(this.selectedASkillBox);
  }

  skillClick(skillListId,selectedValue) {
    clearsessionStorage(skillListId);
    this.createSkillSelectBox(this.searchResultsList[skillListId], "", selectedValue);
    this.createSkillSearchList([]);
  }

  createSelectedSkillList(htmlElement) {
    const div = document.getElementById(this.selectedSkilldiv);
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
    let url;
    if (isLoginUser) {
      url = `https://api.myskillsplus.com/api-child/?path_addr=${skillFileId}`;
    } else {
      url = `${ENDPOINT_URL}children/?path_addr=${skillFileId}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        this.createSkillSearchList(response);
      })
      .catch((err) => console.error(err));
  }

  createSkillButton(htmlElement, skill, breadcrumbPath = []) {
    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("softskillparentaccordian");
    skillsContainer.setAttribute("id", "softskillparentaccordian");
    skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");

    const skillButton = document.createElement("button");
    skillButton.className = "softskillbutton";
    skillButton.style.border = "1px solid rgb(230, 230, 230)";
    skillButton.style.borderRadius = "20px";
    skillButton.style.margin = "5px";
    skillButton.style.padding = "6px 12px";
    skillButton.style.background = "white";
    skillButton.style.cursor = "pointer";
    skillButton.style.color = "rgb(30, 30, 30)";
    skillButton.style.fontSize = "14px";
    skillButton.setAttribute("data-mdb-tooltip-init", "");

    if (skill.proxy) {
      skillButton.setAttribute("title", skill.proxy + " " + skill.name);
    } else {
      skillButton.setAttribute("title", "");
    }

    const childCount = skill.child_count || 0;
    const childCountHtml =
      childCount > 0
        ? `
      <div style="position: relative; text-align: left;">
        <span style="margin-right: 13px;">${skill.name}</span>
        <div style="left: 50%; transform: translateX(-50%); display:inline-block;" title="${childCount} sub categories">
          <span style="height:7px; width:7px; display:inline-block; position:absolute; margin-top:2px; border:2px solid #024FAB;"></span>
          <span style="height:7px; width:7px; display:inline-block; position:relative; border:2px solid #024FAB;"></span>
          <span style="height:7px; width:7px; display:inline-block; position:absolute; margin-top:2px; border:2px solid #024FAB;"></span>
          <span style="height:7px; width:7px; display:inline-block; position:relative; border:2px solid #024FAB;"></span>
        </div>
      </div>
    `
        : `<span>${skill.name}</span>`;

    skillButton.innerHTML = childCountHtml;

    skillButton.addEventListener("click", async () => {
      if (skill.child_count === 0) {
        this.changeRateModelElement(skill);
      } else {
        htmlElement.innerHTML = "";
        this.childrenSkillAPI(skill.path_addr, skill.name);
      }
    });

    skillsContainer.appendChild(skillButton);
    htmlElement.appendChild(skillsContainer);
  }

  createSkillSearchButtonList(
    htmlElement,
    fuctionalAreasList,
    isFuncSkill,
    identifier,
    skillId
  ) {
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
    parentSkillDetailId,
    UIDiv
  ) {
    const userDetails = JSON.parse(localStorage.getItem("loginUserDetail"));
    const userId = userDetails?.id;
    let userRatedSkill = {
      userId,
      skills: [
        {
          path_addr: skillDetail?.path_addr,
          ratings: ratingValue,
        },
      ],
    };

    let url = "";
    if (parentSkillDetailId) {
      url = `${ENDPOINT_URL}details/?path_addrs=${skillDetail?.path_addr}&path_addrs=${parentSkillDetailId}`;
    } else {
      url = `${ENDPOINT_URL}details/?path_addrs=${skillDetail?.path_addr}`;
    }

    fetchData(url, "GET")
      .then((response) => {
        if (parentSkillDetailId) {
          addTolocalStorage({
            comment: commentValue,
            rating: ratingValue,
            isot_file_id: skillDetail?.path_addr,
            isot_file: response[0],
            parentSkillDetailId: parentSkillDetailId,
            parentSkillDetail: response[1],
          });
        } else {
          addTolocalStorage({
            comment: commentValue,
            rating: ratingValue,
            isot_file_id: skillDetail?.path_addr,
            isot_file: response[0],
            parentSkillDetailId: parentSkillDetailId,
            parentSkillDetail: null,
          });
        }

        // toastr.success(`${skillDetail.name}  added to your profile`);
        this.updateProfileData();
        createSelectedSkillsCount();

        UIDiv.style.display = "flex";

        const buttonName = `${skillDetail.path_addr}button`;
        const divName = `${skillDetail.path_addr}div`;
        const skillButton = document.getElementById(buttonName);
        const buttonContentDiv = document.getElementById(divName);
        buttonContentDiv.style.display = "flex";
        buttonContentDiv.style.justifyContent = "flex-start";

        const storageKey = isLoginUser ? "logginUserRatedSkills" : "userRatedSkills";
        const storedSkills = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const matchedSkill = storedSkills.find(s => s.isot_file_id === skillDetail?.path_addr);
        let ratingLabel = "";
        let percentage = 0;
        let showCalendarIcon = false;

        if (matchedSkill?.isot_file?.ratings?.length) {
          let ratingIndex = matchedSkill.rating.length === 2 ? 1 : 0;
          const ratingValue = matchedSkill.rating[ratingIndex]?.rating;
          const ratingScale = matchedSkill.isot_file?.ratings?.[ratingIndex]?.rating_scale_label || [];
          const isCertification = matchedSkill.isot_file.tags?.some(tag => tag.title === "Certifications");

          if (isCertification && matchedSkill.isot_file.ratings[ratingIndex].rating_scale_type === "Two Choice Rating") {
            percentage = (ratingValue === 1) ? 100 : 0;
            ratingLabel = ratingValue === 1 ? ratingScale[0] : "";
          } else {
            const ratingScaleLength = ratingScale.length;
            if (ratingScaleLength > 0) {
              percentage = ((ratingValue - 1) / ratingScaleLength) * 100;
            }
            if (ratingValue > 0) {
              ratingLabel = ratingScale[ratingValue - 2] || "";
            }
            showCalendarIcon = matchedSkill.isot_file?.ratings?.[ratingIndex]?.rating_category === "Experience Level";
          }
        }

       // ======= Create doughnut image =======
        const ratingDetails = document.createElement("div");
        ratingDetails.className = "px-2 rating-details";
        ratingDetails.style.height = buttonContentDiv.offsetHeight + "px";
        ratingDetails.style.display = "flex";
        ratingDetails.style.alignItems = "center";

        if (percentage === 25) {
          const image25 = document.createElement("img");
          image25.src = imagePath + "firstRing.png";
          image25.style.width = "25px";
          image25.style.height = "25px";
          ratingDetails.appendChild(image25);
        }
        if (percentage === 50) {
          const image50 = document.createElement("img");
          image50.src = imagePath + "secondRing.png";
          image50.style.width = "25px";
          image50.style.height = "25px";
          ratingDetails.appendChild(image50);
        }
        if (percentage === 75) {
          const image75 = document.createElement("img");
          image75.src = imagePath + "thirdRing.png";
          image75.style.width = "25px";
          image75.style.height = "25px";
          ratingDetails.appendChild(image75);
        }
        if (percentage === 100) {
          const image100 = document.createElement("img");
          image100.src = imagePath + "forthRing.png";
          image100.style.width = "25px";
          image100.style.height = "25px";
          ratingDetails.appendChild(image100);
        }


        // Create the main flex container for rating details and star
        const ratingFlexContainer = document.createElement("div");
        ratingFlexContainer.style.display = "flex";
        ratingFlexContainer.className = "rating-details-container";
        ratingFlexContainer.style.alignItems = "center";
        ratingFlexContainer.style.gap = "6px"; // for spacing

        const prevRatingContainer = buttonContentDiv.querySelector('.rating-details-container');
        if (prevRatingContainer) {
          prevRatingContainer.remove();
        }

        // Append rating label and doughnut images
        if (ratingLabel) {
          ratingFlexContainer.appendChild(ratingDetails);
        }

        buttonContentDiv.appendChild(ratingFlexContainer);
        UIDiv.appendChild(buttonContentDiv);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  //#####################   create a html rating model box   ############s###########
  changeRateModelElement(skillDetail, parentSkillDetailId) {
    const RateSkillModel = document.getElementById("RateSkillModel");
    const RateSkillModelLabel = document.getElementById("RateSkillModelLabel");
    const spanElementForStar = document.getElementById("spanElementForStar");
    spanElementForStar.innerHTML = "";
    spanElementForStar.style.borderRadius = "10px";
    const rateSkillCommentBox = document.getElementById("rateSkillCommentBox");
    const spanElementForSaveButton = document.getElementById(
      "spanElementForSaveButton"
    );
    spanElementForSaveButton.innerHTML = "";

    //create the cancel button element
    var closebutton = document.createElement("button");
    closebutton.setAttribute("type", "button");
    closebutton.setAttribute("class", "btn");
    closebutton.style.textTransform = "none";
    closebutton.style.boxShadow="none";
    closebutton.style.color = "#1D4ED8";
    closebutton.style.backgroundColor = "transparent";
    closebutton.style.fontSize = "inherit";
    closebutton.style.padding="6px 30px"
    closebutton.style.borderRadius = "6px";
    closebutton.style.border = "1px solid #3B82F6";
    closebutton.style.marginRight = "20px";
    closebutton.style.cursor = "pointer"; 
    closebutton.setAttribute("id", "closeButton");
    closebutton.textContent = "Cancel";
    closebutton.setAttribute("data-mdb-dismiss", "modal");
    closebutton.setAttribute("aria-label", "Close");

    // Create the save button element
    var button = document.createElement("button");
    button.setAttribute("type", "button");
    button.setAttribute("class", "btn btn-primary");
    button.style.textTransform = "none";
    button.style.background = "#007DFC";
    button.style.fontSize = "inherit";
    button.style.paddingRight = "35px";
    button.style.paddingLeft = "35px";
    button.style.paddingTop = "7px";
    button.style.paddingBottom = "7px";
    button.style.borderRadius = "6px";
    button.setAttribute("id", "saveChangesButton");
    // Set the button content
    button.textContent = "Select";
    // Append the button to the document body or any desired parent element
    spanElementForSaveButton.appendChild(closebutton);
    spanElementForSaveButton.appendChild(button);
    let titleText;
    if (skillDetail?.term) {
      titleText = skillDetail?.term;
      skillDetail = skillDetail;
    } else {
      if (skillDetail) {
        titleText = skillDetail.name;
      }
    }

    let objExist = checkElementExist(skillDetail);

    if (objExist && Array.isArray(objExist.rating) && objExist.rating.length > 0) {
      rateSkillCommentBox.value = objExist.rating[0].comment ?? "";
    } else {
      rateSkillCommentBox.value = "";
    }
    const modalEl = new mdb.Modal(RateSkillModel);
    RateSkillModelLabel.style.fontSize = "17px";
    RateSkillModelLabel.innerHTML = `<img src="${imagePath}Group 11.svg" style="height:25px; weight:26px; margin-right:10px;"><span style="color: #635BFF; font-weight:600; font-size:16px;">Ratings -</span>
   <span style="color:#1E1E1E; font-weight:600;"> ${titleText} </span>`;
    this.createRatingElement(
      spanElementForStar,
      skillDetail,
      parentSkillDetailId,
      objExist
    );
    button.removeEventListener("click", this.saveTheSkillComment);
    button.addEventListener("click", (event) => {
      modalEl.hide();
      // updating view
      this.updateProfileData();
    });
    modalEl.show();
  }

  createRatingBox(skillDetail, parentSkillDetailId) {
    let objExist = checkElementExist(skillDetail); // Check if rating already exists

    let ratingBox = document.createElement("div");
    ratingBox.className = "rating-box";
    ratingBox.style.display = "none";
    ratingBox.style.padding = "20px";
    ratingBox.style.border = "1px solid #ccc";
    ratingBox.style.borderRadius = "10px";
    ratingBox.style.marginTop = "10px";
    ratingBox.style.backgroundColor = "#fff";
    ratingBox.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";

    if (skillDetail?.ratings.length > 0) {
        skillDetail.ratings.forEach((rating) => {
            let ratingContainer = document.createElement("div");
            ratingContainer.className = "rating-container";
            ratingContainer.style.marginTop = "10px";

            let ratingLabel = document.createElement("p");
            ratingLabel.innerHTML = `<strong>${rating.rating_category}</strong>`;
            ratingContainer.appendChild(ratingLabel);

            let checkboxWrapper = document.createElement("div");
            checkboxWrapper.style.display = "flex";
            checkboxWrapper.style.flexWrap = "wrap";
            checkboxWrapper.style.gap = "15px";

            let existingRatingValue = null;
            if (objExist && objExist.rating) {
                let existingRating = objExist.rating.find(obj => obj.isot_rating_id === rating._id);
                if (existingRating) {
                    existingRatingValue = existingRating.rating;
                }
            }

            rating.rating_scale_label.forEach((option, index) => {
                let checkboxContainer = document.createElement("div");
                checkboxContainer.className = "checkbox-container";
                checkboxContainer.style.display = "flex";
                checkboxContainer.style.alignItems = "center";

                let checkboxInput = document.createElement("input");
                checkboxInput.type = "checkbox";
                checkboxInput.name = `${rating._id}`;
                checkboxInput.value = rating.rating_scale_type === "Four Scale Rating" ? (index + 2) : (index + 1);
                checkboxInput.className = "checkbox-input";

                let checkboxLabel = document.createElement("label");
                checkboxLabel.innerHTML = option;
                checkboxLabel.style.marginLeft = "5px";

                checkboxContainer.appendChild(checkboxInput);
                checkboxContainer.appendChild(checkboxLabel);
                checkboxWrapper.appendChild(checkboxContainer);

                //Ensure the checkbox is checked if a rating exists (including 0)
                if (existingRatingValue !== null && existingRatingValue !== undefined && rating.rating_scale_type === "Four Scale Rating" ? existingRatingValue === index + 2 : existingRatingValue === index + 1) {
                    checkboxInput.checked = true;
                }

                checkboxInput.addEventListener("change", () => {
                    if (checkboxInput.checked) {
                        document.getElementsByName(`${rating._id}`).forEach((checkbox) => {
                            if (checkbox !== checkboxInput) {
                                checkbox.checked = false;
                            }
                        });
                    }
                });
            });

            ratingContainer.appendChild(checkboxWrapper);
            ratingBox.appendChild(ratingContainer);
        });
    }

    const remarkBox = document.createElement("textarea");
    remarkBox.placeholder = "Enter remark (20 - 100 words)";
    remarkBox.className = "form-control";
    remarkBox.style.width = "100%";
    remarkBox.style.height = "80px";
    remarkBox.style.marginTop = "10px";

    //Ensure empty comment is handled properly
    if (objExist && objExist.comment !== undefined && objExist.comment !== null) {
        remarkBox.value = objExist.comment;
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "10px";

    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.className = "btn btn-secondary";
    cancelButton.style.marginRight = "10px";
    cancelButton.addEventListener("click", () => {
        ratingBox.style.display = "none";
    });

    const saveButton = document.createElement("button");
    saveButton.innerText = "Save";
    saveButton.className = "btn btn-primary";
    saveButton.addEventListener("click", () => {
        let inputData = [];
        const comment = remarkBox.value.trim(); // Trim whitespace
        let hasInvalidRating = false;

        skillDetail.ratings.forEach((rating) => {
            let isChecked = false;
            document.getElementsByName(`${rating._id}`).forEach((input) => {
                if (input.checked) {
                    isChecked = true;
                    inputData.push({
                        isot_rating_id: rating._id,
                        rating: parseInt(input.value),
                        comment: comment || "", // Ensure comment is always included
                    });
                }
            });
            if (!isChecked) {
                hasInvalidRating = true;
                toastr.error("Please select an option for " + rating.rating_category);
            }
        });

        if (!hasInvalidRating) {
            this.saveTheSkillComment(comment, inputData, skillDetail, parentSkillDetailId);
            ratingBox.style.display = "none";
        }
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    ratingBox.appendChild(remarkBox);
    ratingBox.appendChild(buttonContainer);

    return ratingBox;
  }

  createCircleButton({ iconClass, iconColor, backgroundColor, onClick }) {
      const button = document.createElement("button");

      const icon = document.createElement("i");
      icon.className = iconClass;

      // Center icon properly (no weird offsets)
      icon.style.color = iconColor;
      icon.style.fontSize = "15px";
      icon.style.lineHeight = "1"; // prevents vertical misalignment
      icon.style.display = "flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";

      // Button styling
      button.style.width = "1.3rem";
      button.style.height = "1.3rem";
      button.style.border = "none";
      button.style.borderRadius = "50%";
      button.style.background = backgroundColor;
      button.style.cursor = "pointer";
      button.style.marginRight = "1rem";
      button.style.marginLeft = "0.8rem";
      button.style.marginTop = "0.5rem"

      // Perfect centering
      button.style.display = "flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";


      button.appendChild(icon);
      button.addEventListener("click", onClick);

      return button;
  }

  createRatingBoxSearchPage(skillDetail, parentSkillDetailId, addSkillIcon, btnGroupDiv, pill) {
    let objExist = checkElementExist(skillDetail); 

    let url = "";
    
    url = `${ENDPOINT_URL}details/?path_addrs=${skillDetail?.path_addr}`;

    let ratingBox = document.createElement("div");
    ratingBox.className = "rating-box";
    ratingBox.setAttribute("data-ratingbox-addr", skillDetail.path_addr);
    ratingBox.style.display = "none";
    ratingBox.style.backgroundColor = "#fff";
    ratingBox.style.marginLeft = "1.5rem";

    ratingBox.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    
    fetchData(url, "GET")
      .then((response) => {
        if (response[0]?.ratings.length > 0) {

          const buttonsWrapper = document.createElement("div");
          buttonsWrapper.style.position = "relative";

          const cancelButton = this.createCircleButton({
                    iconClass: "fa-solid fa-xmark",
                    iconColor: "#9A9A9A",
                    backgroundColor: "#C7C7C7",
                    onClick: () => {
                        ratingBox.style.display = "none";
                        addSkillIcon.style.display = "block";
                        cancelButton.style.display = "none";
                    }
                });

                const saveButton = this.createCircleButton({
                    iconClass: "fa-solid fa-check",
                    iconColor: "#0be96b",
                    backgroundColor: "#91FFC1",
                    onClick: () => {
                        let inputData = [];
                        const comment = "";
                        let hasInvalidRating = false;
                                
                        response[0].ratings.forEach((rating) => {
                            let isChecked = false;
                            document.getElementsByName(`${rating._id}`).forEach((input) => {
                                if (input.checked) {
                                    isChecked = true;
                                    inputData.push({
                                        isot_rating_id: rating._id,
                                        rating: parseInt(input.value),
                                        comment: comment || "", // Ensure comment is always included
                                    });
                                }
                            });
                            if (!isChecked) {
                                hasInvalidRating = true;
                                toastr.error("Please select an option for " + rating.rating_category);
                            }
                        });
                      
                        if (!hasInvalidRating) {
                          this.saveTheSkillComment(comment, inputData, skillDetail, parentSkillDetailId, pill);
                          ratingBox.style.display = "none";
                          saveButton.style.display = "none";
                        }
                    }
                });

                saveButton.style.display = "none";
              
                buttonsWrapper.appendChild(cancelButton);
                buttonsWrapper.appendChild(saveButton);

        
            response[0].ratings.forEach((rating) => {
                let ratingContainer = document.createElement("div");
                ratingContainer.className = "rating-container";
                ratingContainer.style.marginTop = "10px";

                const ratingLabelWrapper = document.createElement("div");
                ratingLabelWrapper.style.display = "flex";
                ratingLabelWrapper.style.justifyContent = "space-between";
    
                let ratingLabel = document.createElement("p");
                ratingLabel.className = "rating-label";
                ratingLabel.innerHTML = `<strong>Select ${rating.rating_category}</strong>`;
                ratingLabelWrapper.appendChild(ratingLabel);

                btnGroupDiv = (btnGroupDiv === undefined) ? ratingLabelWrapper : btnGroupDiv;

                btnGroupDiv.appendChild(buttonsWrapper);

                ratingContainer.appendChild(ratingLabelWrapper);
                
    
                let checkboxWrapper = document.createElement("div");
                checkboxWrapper.className = "checkbox-wrapper";
                checkboxWrapper.style.display = "flex";
                checkboxWrapper.style.flexWrap = "wrap";
                checkboxWrapper.style.gap = "15px";
                checkboxWrapper.style.border = "1px solid #F2F2F2";
                checkboxWrapper.style.borderRadius = "0.5rem";
                checkboxWrapper.style.padding = "0.5rem";
                checkboxWrapper.style.width = "fit-content";
                checkboxWrapper.style.marginTop = "-0.7rem";
                checkboxWrapper.style.marginBottom = "1rem";
    
                let existingRatingValue = null;
                if (objExist && objExist.rating) {
                    let existingRating = objExist.rating.find(obj => obj.isot_rating_id === rating._id);
                    if (existingRating) {
                        existingRatingValue = existingRating.rating;
                    }
                }
    
                rating.rating_scale_label.forEach((option, index) => {
                    let checkboxContainer = document.createElement("div");
                    checkboxContainer.className = "checkbox-container";
                    checkboxContainer.style.display = "flex";
                    checkboxContainer.style.alignItems = "center";
    
                    let checkboxInput = document.createElement("input");
                    checkboxInput.type = "radio";
                    checkboxInput.name = `${rating._id}`;
                    checkboxInput.value = rating.rating_scale_type === "Four Scale Rating" ? (index + 2) : (index + 1);
                    checkboxInput.className = "checkbox-input";
    
                    let checkboxLabel = document.createElement("label");
                    checkboxLabel.className = "checkbox-label";
                    checkboxLabel.innerHTML = option;
                    checkboxLabel.style.marginLeft = "5px";
    
                    checkboxContainer.appendChild(checkboxInput);
                    checkboxContainer.appendChild(checkboxLabel);
                    checkboxWrapper.appendChild(checkboxContainer);
    
                    //Ensure the checkbox is checked if a rating exists (including 0)
                    if (existingRatingValue !== null && existingRatingValue !== undefined && rating.rating_scale_type === "Four Scale Rating" ? existingRatingValue === index + 2 : existingRatingValue === index + 1) {
                        checkboxInput.checked = true;
                    }
    
                    checkboxInput.addEventListener("change", () => {
                        if (checkboxInput.checked) {
                            cancelButton.style.display = "none";
                            saveButton.style.display = "inline-block";
                            document.getElementsByName(`${rating._id}`).forEach((checkbox) => {
                                if (checkbox !== checkboxInput) {
                                    checkbox.checked = false;
                                }
                            });
                        } else {
                            cancelButton.style.display = "inline-block";
                            saveButton.style.display = "none";
                        }
                    });
                });
    
                ratingContainer.appendChild(checkboxWrapper);
                ratingBox.appendChild(ratingContainer);
            });
        }
    
      })
      .catch((err) => {
      console.error(err);
      });

    return ratingBox;
  }


  processRelatedSkills(
    htmlElement,
    skillList,
    identifier,
    skillId,
    isInitialLoad = true
  ) {
    const CardBody = document.createElement("div");

    if (skillList.length > 0) {
      if (
        isInitialLoad &&
        skillList[0].name === "Related Skills" &&
        skillList[0].path_addr
      ) {
        const url = `${ENDPOINT_URL}children/?path_addr=${skillList[0].path_addr}`;

        fetchData(url, "GET")
          .then((response) => {
            if (response !== undefined) {

              // Filter out skills with child_count equal to 1
              const validRelatedSkills = response.filter(
                (skill) => skill.child_count !== 1
              );

              if (validRelatedSkills.length > 0) {
                const h5 = document.createElement("div");
                h5.setAttribute("class", "card-title text-start");
                h5.style.margin = "30px 10px";
                h5.style.marginBottom = "12px";
                h5.textContent = skillList[0].name;

                this.cardBodyDiv.appendChild(h5);

                this.processRelatedSkills(
                  this.cardBodyDiv,
                  validRelatedSkills,
                  response,
                  "Related Skills",
                  skillId,
                  false // Pass false to indicate that this is not the initial load
                );
              }
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        CardBody.style.backgroundColor = "white";
        CardBody.style.padding = "0 12px";
        CardBody.style.paddingBottom = "12px";
        CardBody.classList.add("card-body-accordion");
        CardBody.style.borderRadius = "10px";
        CardBody.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.2)";

        // Pass the skillId correctly
        this.renderRelatedHardSkills(skillList, [], CardBody, skillId);

        // Append CardBody to the htmlElement
        htmlElement.appendChild(CardBody);
      }
    } else {
      CardBody.innerHTML = "";
      htmlElement.appendChild(CardBody);
    }
  }

  async createSelectSkillsChildBox(
    skillName,
    htmlElement,
    skillList,
    identifier,
    skillId,
    breadcrumbPath = [],
    isInitialLoad = true,
    highlightSkill,
    clickedSkillParentName,
    clickedSkillParenId
  ) {

    // Filter the skillList to handle "Related Skills"
    const updatedSkillList = [];
    for (const skill of skillList) {
      if (skill.name === "Related Skills") {
        const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        try {
          const relatedSkills = await this.fetchSkillsAsync(relatedSkillApiEndpoint);
          if (relatedSkills.length > 0) {
            skill.child_count = relatedSkills.length;
            updatedSkillList.push(skill);
          }
        } catch (error) {
          console.error(
            `Error fetching related skills for ${skill.name}:`,
            error
          );
        }
      } else {
        updatedSkillList.push(skill);
      }
    }

    const CardBody = document.createElement("div");

    if (updatedSkillList.length > 0) {
      CardBody.style.padding = "0 12px";
      CardBody.style.paddingBottom = "12px";
      CardBody.classList.add("card-body-accordion", "skill-accordion");
      CardBody.style.borderRadius = "10px";

      this.renderHardSkills(
        updatedSkillList,
        breadcrumbPath,
        CardBody,
        skillId,
        updatedSkillList,
        skillName,
        highlightSkill,
        clickedSkillParentName,
        clickedSkillParenId
      );
    } else {
      CardBody.innerHTML = "";
    }

    htmlElement.appendChild(CardBody);
  }

  async createCategorySelectSkillsChildBox(
    skillName,
    htmlElement,
    skillList,
    identifier,
    skillId,
    breadcrumbPath = [],
    isInitialLoad = true,
    highlightSkill,
    clickedSkillParentName,
    clickedSkillParentId
  ) {

    // Filter the skillList to handle "Related Skills"
    const updatedSkillList = [];
    for (const skill of skillList) {
      if (skill.name === "Related Skills") {
        const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        try {
          const relatedSkills = await this.fetchSkillsAsync(relatedSkillApiEndpoint);
          if (relatedSkills.length > 0) {
            skill.child_count = relatedSkills.length;
            updatedSkillList.push(skill);
          }
        } catch (error) {
          console.error(`Error fetching related skills for ${skill.name}:`, error);
        }
      } else {
        updatedSkillList.push(skill);
      }
    }

    const CardBody = document.createElement("div");

    const cardBodyInnerDiv = document.createElement("div");
    cardBodyInnerDiv.style.backgroundColor = "white";
    cardBodyInnerDiv.classList.add("card-body-child-accordion");
    cardBodyInnerDiv.style.borderRadius = "10px";
    cardBodyInnerDiv.style.marginBottom = "10px";

    if (updatedSkillList.length > 0) {
      CardBody.style.backgroundColor = "white";
      CardBody.style.padding = "0 12px";
      CardBody.style.paddingBottom = "12px";
      CardBody.classList.add("card-body-accordion", "skill-child-accordion");
      CardBody.style.borderRadius = "10px";
      CardBody.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

      const skillsContainer = document.createElement("div");
      skillsContainer.classList.add("softskillparentaccordian");
      skillsContainer.setAttribute("id", "softskillparentaccordian");
      skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
      skillsContainer.style.textAlign = "left";
      updatedSkillList.sort(
        (a, b) =>
          (a.display_order !== null ? a.display_order : Infinity) -
          (b.display_order !== null ? b.display_order : Infinity)
      );
      updatedSkillList.forEach((skill) => {
        const skillButton = document.createElement("button");
        skillButton.className = "softskillbutton";
        skillButton.setAttribute("id", skill.path_addr + "button");
        skillButton.style.border = "2px solid #16a085";
        skillButton.style.borderRadius = "20px";
        skillButton.style.margin = "5px";
        skillButton.style.padding = "6px 12px";
        skillButton.style.background = "#FFFFFF";
        skillButton.style.cursor = "pointer";
        skillButton.style.color = "#4f4f4f";
        skillButton.style.fontWeight = "500";
        skillButton.style.fontSize = "14px";
        skillButton.setAttribute("data-mdb-tooltip-init", "");

        const childCount = skill.child_count || 0;
        const ratingsCount = skill.ratings ? skill.ratings.length : 0;
        const description = skill.description;

        const buttonContentDiv = document.createElement("div");
        buttonContentDiv.setAttribute("id", skill.path_addr + "div");
        buttonContentDiv.style =
          "display:flex; align-items:center; justify-content:center;";

        const skillNameSpan = document.createElement("span");
        skillNameSpan.textContent = skill.name;
        if (skill.name.length > 40) {
          skillNameSpan.classList.add("truncate");
          if(skill.proxy_skill){
            manageTooltip(skillNameSpan, skill.proxy_skill.name);
          }
          else{
            manageTooltip(skillNameSpan, skill.name);
          }
        }else if (skill.proxy_skill){
          manageTooltip(skillNameSpan, skill.proxy_skill.name);
        }

        buttonContentDiv.appendChild(skillNameSpan);
        if (childCount > 0) {
          const hoverCircleImg = document.createElement("img");
          hoverCircleImg.className="hovercircle";
          hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
          hoverCircleImg.alt = "circle";
          hoverCircleImg.style.width = "20px";
          hoverCircleImg.style.height = "20px";
          const tooltip = `${childCount} sub categories`;
          hoverCircleImg.style.marginLeft = "5px";
          buttonContentDiv.appendChild(hoverCircleImg);
          manageTooltip(hoverCircleImg, tooltip);
        }

        if (ratingsCount > 0) {
          const searchText = searchByName(skill.name, skill.path_addr);
          if (searchText.length > 0) {
              const starIcon = document.createElement("img");
              starIcon.src = `${imagePath}Group 25.svg`;
              starIcon.style.marginLeft = "5px";
              starIcon.style.cursor = "pointer";
              starIcon.addEventListener("click", (event) => {
                  event.stopPropagation();
                  this.saveTheSkillComment("", "", skill, "");
              });
              buttonContentDiv.appendChild(starIcon);
              skillButton.classList.add('rated-skill');
          } else {
              const starIcon = document.createElement("img");
              starIcon.src = `${imagePath}Group 24.svg`;
              starIcon.setAttribute("id", skill.path_addr);
              starIcon.style.marginLeft = "5px";
              starIcon.style.cursor = "pointer";
              starIcon.addEventListener("click", (event) => {
                  event.stopPropagation();
                  this.saveTheSkillComment("", "", skill, "");
              });
              buttonContentDiv.appendChild(starIcon);
          }
        }

        skillButton.appendChild(buttonContentDiv);

        skillButton.addEventListener("click", async () => {
          const allButtons = document.querySelectorAll(".softskillbutton");
          allButtons.forEach((btn) => {
            btn.classList.remove("active-skill-button");

            const hoverCircle = btn.querySelector(".hovercircle");
            if (hoverCircle) {
                hoverCircle.style.filter = "none"; 
            }
          });
    

          // Add active class to the clicked button
          skillButton.classList.add("active-skill-button");
          const hoverCircle = skillButton.querySelector(".hovercircle");
          if (hoverCircle) {
            hoverCircle.style.filter = "brightness(0.7)"; // or remove the filter
          }

          if (skill.child_count === 0 && skill.ratings.length > 0) {
            console.log("zeroskill-data", skill);
          } else if (skill.name === "Related Skills") {
            const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
            const relatedSkills = await this.fetchSkillsAsync(
              relatedSkillApiEndpoint
            );
            relatedSkills.forEach((skill) => {
              if (skill.child_count === 1 && skill.ratings.length > 0) {
                skill.child_count = 0;
              }
            });
            if (relatedSkills.length > 0) {
              const validRelatedSkills = relatedSkills.filter(
                (relatedSkill) => relatedSkill.child_count !== 1
              );
              const newBreadcrumbPath = [
                ...breadcrumbPath,
                {
                  name: skill.name,
                  path_addr: skill.path_addr,
                  ratings: skill.ratings,
                },
              ];
              this.renderCategoryHardSkills(
                validRelatedSkills,
                newBreadcrumbPath,
                cardBodyInnerDiv,
                skill.path_addr,
                [],
                skillName,
                highlightSkill,
                clickedSkillParentName,
                clickedSkillParentId
              );
            }
          } else {
            if (skill.child_count > 0 && skill.name !== "Related Skills") {
              const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
              const childSkills = await this.fetchSkillsAsync(childSkillApiEndpoint);
              const validChildSkills = childSkills.filter(
                (skill) => skill.name !== "Related Skills"
              );
              const newBreadcrumbPath = [
                ...breadcrumbPath,
                {
                  name: skill.name,
                  path_addr: skill.path_addr,
                  ratings: skill.ratings,
                },
              ];
              this.renderCategoryHardSkills(
                validChildSkills,
                newBreadcrumbPath,
                cardBodyInnerDiv,
                skill.path_addr,
                [],
                skillName,
                highlightSkill,
                clickedSkillParentName,
                clickedSkillParentId
              );
            }
          }
        });

        // Automatically click the skill if it matches clickedSkillParentName
        if (skill.name === "Related Skills" || skill.name === skillName) {
          skillButton.click();
        }

        skillsContainer.appendChild(skillButton);
      });

      CardBody.appendChild(skillsContainer);
      CardBody.appendChild(cardBodyInnerDiv);
    } else {
      CardBody.innerHTML = "";
    }

    htmlElement.appendChild(CardBody);
  }

  createSkillPath(htmlElement, skillList) {
    const ol = document.createElement("ol");
    ol.setAttribute("class", "breadcrumb");
    var skills;
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
      if (skill.ratings && skill.ratings.length > 0) {
        const searchText = searchByName(skill.name,skill.path_addr);
        if (searchText.length > 0) {
          const starIcon = document.createElement("img");
          starIcon.src = `${imagePath}Group 23.svg`;
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          li.style =
            "background-color:#E0DEFF; padding-right:16px; padding-left:16px; padding-top:4px; padding-bottom:4px; border-radius:7px; box-shadow:rgba(0,0,0,0.1) 0px 2px 8px;";
          li.appendChild(starIcon);
        } else {
          const starIcon = document.createElement("i");
          starIcon.className = "fas fa-star";
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.style.color = "#ccccff";
          li.style =
            "background-color:white; padding-right:16px; padding-left:16px; padding-top:4px; padding-bottom:4px; border-radius:7px; box-shadow:rgba(0,0,0,0.1) 0px 2px 8px;";
          li.appendChild(starIcon);
        }
      }
      skills = skill;
    });
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "breadcrumb");
    nav.setAttribute("class", "breadcrumb-nav");
    nav.setAttribute("id", skills.path_addr);
    nav.appendChild(ol);
    nav.addEventListener("click", () => {
      this.changeRateModelElement(skills);
    });
    htmlElement.appendChild(nav);
  }

  //###############################################################       get Rating model section data   #############################
  createRatingElement(htmlElement, skillDetail, parentSkillDetailId, objExist) {
    // add exception for rating
    try {
      htmlElement.noUiSlider.destroy();
    } catch (error) {
      console.log("error in destroying slider", error);
    }
    if (skillDetail?.ratings.length > 0) {
      let ratingOptions = skillDetail?.ratings;
      var arbitraryValuesForSlider = ratingOptions;
      const modalBodyGet = document.getElementById("spanElementForStar");
      arbitraryValuesForSlider.forEach((sliderObj) => {
        let spanSliderInnerDiv = document.createElement("div");
        spanSliderInnerDiv.className = "slider-container";
        spanSliderInnerDiv.style =
          "border-bottom:2px solid #E9EDF1 !important; display:flex !important;";
        spanSliderInnerDiv.style.flexWrap = "wrap";
        let htmlElementLabel = document.createElement("label");
        htmlElementLabel.className = "rating-label";
        htmlElementLabel.style.fontWeight = "bold";
        htmlElementLabel.style.marginBottom = "15px";
        htmlElementLabel.style.marginTop = "15px";
        htmlElementLabel.textContent = sliderObj.rating_category;
        const options = sliderObj.rating_scale_label;
        spanSliderInnerDiv.id = `spanElementForStar-${sliderObj._id}`;
        if (options.length === 2) {
          if (
            ratingOptions.length == 1 &&
            sliderObj.rating_scale_type === "Two Choice Rating"
          ) {
            options.forEach((option, index) => {
              if (option === "Yes") {
                // Only create checkbox for "Yes"
                let checkboxContainer = document.createElement("div");
                checkboxContainer.className = "checkbox-container";
                checkboxContainer.style.display = "flex";
                checkboxContainer.style.alignItems = "center";
                checkboxContainer.style.marginRight = "10px";

                let checkboxInput = document.createElement("input");
                checkboxInput.type = "checkbox";
                checkboxInput.style.width = "1.1rem";
                checkboxInput.style.height = "1.1rem";
                checkboxInput.name = `${sliderObj._id}`;
                checkboxInput.value = index + 1;
                checkboxInput.id = `rating-${sliderObj._id}-${index + 1}`;
                checkboxInput.className = "checkbox-input";

                let checkboxLabel = document.createElement("label");
                checkboxLabel.htmlFor = checkboxInput.id;
                checkboxLabel.textContent = option;
                checkboxLabel.className = "checkbox-label";
                checkboxLabel.style.marginLeft = "5px";

                // Append checkbox and label to container
                checkboxContainer.appendChild(checkboxInput);
                checkboxContainer.appendChild(checkboxLabel);
                spanSliderInnerDiv.appendChild(checkboxContainer);

                // Check if rating exists and mark checkbox as checked if necessary
                if (objExist) {
                  objExist.rating.forEach((obj) => {
                    if (
                      obj.isot_rating_id === sliderObj._id &&
                      obj.rating === index + 1
                    ) {
                      checkboxInput.checked = true;
                    }
                  });
                }

                // Add event listener to ensure only one checkbox is checked at a time
                checkboxInput.addEventListener("change", () => {
                  if (checkboxInput.checked) {
                    const checkboxes = document.getElementsByName(
                      `${sliderObj._id}`
                    );
                    checkboxes.forEach((checkbox) => {
                      if (checkbox !== checkboxInput) {
                        checkbox.checked = false;
                      }
                    });
                  }
                });
              }
            });
          } else {
            options.forEach((option, index) => {
              let checkboxContainer = document.createElement("div");
              checkboxContainer.className = "checkbox-container";
              checkboxContainer.style.display = "flex";
              checkboxContainer.style.alignItems = "center";
              checkboxContainer.style.marginRight = "10px";
              let checkboxInput = document.createElement("input");
              checkboxInput.type = "checkbox";
              checkboxInput.style = "width:1.1rem;height:1.1rem;";
              checkboxInput.name = `${sliderObj._id}`;
              checkboxInput.value = index + 1;
              checkboxInput.id = `rating-${sliderObj._id}-${index + 1}`;
              checkboxInput.className = "checkbox-input";
              let checkboxLabel = document.createElement("label");
              checkboxLabel.htmlFor = `${sliderObj._id}`;
              checkboxLabel.textContent = option;
              checkboxLabel.className = "checkbox-label";
              checkboxLabel.style.marginLeft = "5px";
              checkboxContainer.appendChild(checkboxInput);
              checkboxContainer.appendChild(checkboxLabel);
              spanSliderInnerDiv.appendChild(checkboxContainer);

              if (objExist && Array.isArray(objExist.rating)) {
                // Check if the rating exists and is an array
                objExist.rating.forEach((obj) => {
                    if (obj.isot_rating_id === sliderObj._id) {
                        startValue = options[obj.rating - 1];
                    }
                });
              }
              //To select the one checkbox at the time
              checkboxInput.addEventListener("change", () => {
                if (checkboxInput.checked) {
                  const checkboxes = document.getElementsByName(
                    `${sliderObj._id}`
                  );
                  checkboxes.forEach((checkbox) => {
                    if (checkbox !== checkboxInput) {
                      checkbox.checked = false;
                    }
                  });
                }
              });
            });
          }
        } else {
          // Creating a slider
          if (!options.includes("Not Rated")) {
            options.unshift("Not Rated");
          }

          var format = {
            to: function (value) {
              return options[Math.round(value)];
            },
            from: function (value) {
              console.warn("from", value, options.indexOf(value));
              return options.indexOf(value);
            },
          };

          const connectArray = new Array(options.length).fill(false);
          let startValue = options[0];

          if (objExist) {
            // check if the rating is already exist
            objExist.rating.forEach((obj) => {
              if (obj.isot_rating_id === sliderObj._id) {
                startValue = options[obj.rating - 1];
              }
            });
          }

          connectArray[0] = true;
          let noUiSliderElement = noUiSlider.create(spanSliderInnerDiv, {
            start: [startValue],
            range: {
              min: 0,
              max: options.length - 1,
            },
            step: 1,
            format: format,
            pips: { mode: "steps", format: format, density: 50 },
            connect: "lower",
          });

          spanSliderInnerDiv.classList.add("slider");
        }
        modalBodyGet.appendChild(htmlElementLabel);
        modalBodyGet.appendChild(spanSliderInnerDiv);

      });
      var sliderStyleConnect = document.createElement("style");
      sliderStyleConnect.innerHTML =
        ".noUi-connect { background-color: #007DFC; }";
      document.head.appendChild(sliderStyleConnect);
      const sliderHandleConnects = htmlElement.querySelector(".noUi-connects");
      if (sliderHandleConnects) {
        sliderHandleConnects.style.borderRadius = "10px";
      }
      // slider hright
      var nouiHorizontalSliderHeight = document.createElement("style");
      nouiHorizontalSliderHeight.innerHTML =
        ".noUi-horizontal { height: 10px; }";
      document.head.appendChild(nouiHorizontalSliderHeight);
      var sliderHandleContentTouch = document.createElement("style");
      sliderHandleContentTouch.innerHTML =
        ".noUi-handle:after, .noUi-handle:before { content: none; }";
      document.head.appendChild(sliderHandleContentTouch);
      var sliderHandleLabelLines = document.createElement("style");
      sliderHandleLabelLines.innerHTML =
        ".noUi-marker-large .noUi-marker-sub { display: none; }";
      document.head.appendChild(sliderHandleLabelLines);
      // slider point circle
      var sliderStyleHorizontalAndHandle = document.createElement("style");
      sliderStyleHorizontalAndHandle.innerHTML =
        ".noUi-horizontal .noUi-handle { height: 22px !important; width: 22px; border-radius: 50%; background-color: #007DFC;border :5px solid white;box-shadow:none;}";
      document.head.appendChild(sliderStyleHorizontalAndHandle);
      const sliderHandle = htmlElement.querySelector(".noUi-handle-lower");
      if (sliderHandle) {
        sliderHandle.style.background = "#007DFC";
        sliderHandle.style.border = "5px solid white";
        sliderHandle.style.borderRadius = "50%";
        sliderHandle.style.content = "none";
        var nouiHorizontalSliderHeight = document.createElement("style");
      }

      // Rest of your code...
    }
    // remove a model box child element after close the model box
    const closeButton = document.getElementById("RateSkillModelBtn");
    // Add an id to the button

    var modalBody = document.getElementsByClassName("modal-body")[0];
    closeButton.addEventListener("click", () => {
      const parentIDByDynamicIDGet = document.getElementById(
        "parent-" + closeButton.getAttribute("data-panel-id")
      );
      if (parentIDByDynamicIDGet) {
        parentIDByDynamicIDGet.click();
      }
      modalBody.querySelector("#spanElementForStar").innerHTML = "";
    });
    // getting data from clicking saveChangesButton
    const saveButton = document.getElementById("saveChangesButton");
    saveButton.addEventListener("click", () => {
      let inputData = [];
      const comment = document.getElementById("rateSkillCommentBox").value;
      // Retrieving data value from the radio buttons and sliders
      let hasInvalidRating = false;
      // Retrieving data value from the checkbox and sliders
      arbitraryValuesForSlider.forEach((sliderObj) => {
        if (sliderObj.rating_scale_label.length === 2) {
          const checkboxInputs = document.getElementsByName(`${sliderObj._id}`);
          let isChecked = false;
          checkboxInputs.forEach((input) => {
            if (input.checked) {
              isChecked = true;
              inputData.push({
                isot_rating_id: input?.name,
                rating: parseInt(input.value),
                comment: comment,
              });
            }
          });
          if (!isChecked) {
            hasInvalidRating = true;
            toastr.error("Kindly Experience Recency to complete Selection");
          }
        } else {
          const sliderValue = document.getElementById(
            `spanElementForStar-${sliderObj._id}`
          ).noUiSlider;
          const handlerValue = sliderValue.get();
          const indexValue =
            sliderObj?.rating_scale_label.indexOf(handlerValue);
          if (indexValue !== 0) {
            inputData.push({
              isot_rating_id: sliderObj._id,
              rating: indexValue + 1,
              comment: comment,
            });
          } else {
            // Show toast error if zero rating selected
            hasInvalidRating = true;
            toastr.error("Kindly rate proficiency to complete Selection");
          }
        }
      });
      if (hasInvalidRating) {
        setTimeout(() => {
          document.getElementById(skillDetail.path_addr).click();
        }, 1);
        return; // Exit the function without saving the skill comment
      }

      this.saveTheSkillComment(
        comment,
        inputData,
        skillDetail,
        parentSkillDetailId
      );
    });
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
      fetchData(loggedInUserApiEndpoint, "GET")
        .then((response) => {
          if (response !== undefined) {
            let skillList = response?.data;

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
                iElement.parentElement.remove();
                delete_skill(skill.id);
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
          delete_skill(skill.isot_file_id);
          this.createListProfileSkills();
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

    htmlElement.appendChild(div);
  }

  createSkillSelectBox(skillDetail, identifier, selectedValue) {
   const skillDetailArray = JSON.parse(sessionStorage.getItem("items"));
    this.searchInputBox.value =
      skillDetailArray !== null ? skillDetailArray[0].name : skillDetail.term;
    this.selectedASkillBox.innerHTML = "";
    const cardDiv = document.createElement("div");
    document.getElementById("replaceholder").innerHTML = "";
    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.id = "card-body-accordion";
    const cardTitleH4 = document.createElement("h4");
    cardTitleH4.classList.add("card-title", "create-card-title");
    cardTitleH4.style = "display: flex; padding-top: 10px;";
    const skillButton = document.createElement("button");
    skillButton.className = "softskillbutton";
    skillButton.setAttribute("id", skillDetail.skills[0].path_addr + "button");
    skillButton.style.border = "1px solid #4f4f4f";
    skillButton.style.borderRadius = "20px";
    skillButton.style.margin = "5px";
    skillButton.style.padding = "6px 12px";
    skillButton.style.backgroundColor = "#FFFFFF";
    skillButton.style.cursor = "pointer";
    skillButton.style.color = "#4f4f4f";
    skillButton.style.fontWeight = "500";
    skillButton.style.fontSize = "14px";
    skillButton.setAttribute("data-mdb-tooltip-init", "");
    const buttonContentDiv = document.createElement("div");
    buttonContentDiv.setAttribute(
      "id",
      skillDetail.skills[0].path_addr + "div"
    );
    buttonContentDiv.style =
      "display:flex; align-items:center; justify-content:center;";
    const skillNameSpan = document.createElement("span");
    skillNameSpan.textContent = skillDetail.skills[0].name;
    const description = skillDetail.skills[0].description;
    const ratingsCount = skillDetail.skills[0].ratings
      ? skillDetail.skills[0].ratings.length
      : 0;
    if (skillDetail.skills[0].proxy_skill) {
      manageTooltip(skillNameSpan, skillDetail.skills[0].proxy_skill.name);
    } else if (skillDetail.skills[0].name.length > 30) {
      skillNameSpan.classList.add("truncate");
      manageTooltip(skillNameSpan, skillDetail.skills[0].name);
    }
    if (description) {
      const descriptionImg = document.createElement("img");
      descriptionImg.src = `${imagePath}Group 27.svg`;
      descriptionImg.alt = "description";
      descriptionImg.style.marginRight = "10px";
      descriptionImg.style.width = "18px";
      descriptionImg.style.height = "18px";
      buttonContentDiv.appendChild(descriptionImg);
      manageTooltip(descriptionImg, description);
    }

    buttonContentDiv.appendChild(skillNameSpan);

    if (ratingsCount > 0) {
      const searchText = searchByName(skillDetail.skills[0].name,skillDetail.skills[0].path_addr);
      if (searchText.length > 0) {
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 25.svg`;
        starIcon.style.marginLeft = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          this.saveTheSkillComment("", "", skillDetail.skills[0], "");
        });
        buttonContentDiv.appendChild(starIcon);
        skillButton.style.backgroundColor = "#E0DEFF";
      }
      else{
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 24.svg`;
        starIcon.style.marginLeft = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          this.saveTheSkillComment("", "", skillDetail.skills[0], "");
        });
        starIcon.setAttribute("id", skillDetail.skills[0].path_addr);
        buttonContentDiv.appendChild(starIcon);
      }
      // }
    }
    skillButton.appendChild(buttonContentDiv);
    this.cardBodyDiv = cardBodyDiv;
    cardTitleH4.appendChild(skillButton);
    if (skillDetail?.skills?.length > 0 && !selectedValue) {
      skillDetail.skills.forEach((skill) => {
        this.treeSkillAPI(
          skillDetail.skills[0].name,
          cardBodyDiv,
          skill.path_addr
        );
      });
    } else {
      this.childrenSkillAPI(
        skillDetail.skills[0].name,
        skillDetail.skills[0].path_addr,
        identifier
      );
    }
    // homeTabDiv.appendChild(cardBodyDiv);
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

    tabNavLi1.classList.add("nav-item ");
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
      url = `${ENDPOINT_URL}popular-categories/`;
    }

    fetch(url)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "limit-exceeded.html";
        } else {
          return response.json();
        }
      })
      .then((response) => {

        this.createSkillSearchButtonList(this.funcSkillCard, response, true);
      })
      .catch((err) => console.error(err));
  }

  sortSkillsByTagId(skills) {

    const order = ["tags/2", "tags/7", "tags/6","tags/17","tags/5","tags/1","tags/20","tags/4","tags/13","tags/16","tags/15","tags/11","tags/14","tags/12","tags/8","tags/9","tags/3","tags/10","tags/18","tags/19","tags/21","tags/22","tags/23","tags/24","tags/25","tags/26","tags/27","tags/28"];

    return skills.sort((a, b) => {
      const tagsA = a.isot_file.tags;
      const tagsB = b.isot_file.tags;
  
      const tagIdA = tagsA.length === 2 ? tagsA[1]._id : tagsA[0]?._id;
      const tagIdB = tagsB.length === 2 ? tagsB[1]._id : tagsB[0]?._id;
  
      return order.indexOf(tagIdA) - order.indexOf(tagIdB);
    });
  }

  sortByPathAddrHierarchy(skills) {
    const skillMap = new Map();

    // Step 1: Store skills by their path_addr
    skills.forEach(skill => {
        skillMap.set(skill.isot_file.path_addr, skill);
    });

    // Step 2: Create a sorted result list
    const sortedResult = [];

    // Step 3: Identify parent skills (skills without a longer path variation)
    skills.forEach(skill => {
        const parentPath = skill.isot_file.path_addr;
        if (!sortedResult.includes(skill)) {
            sortedResult.push(skill);
        }
        // Find child skills that start with this parent's path
        skills.forEach(childSkill => {
            if (
                childSkill.isot_file.path_addr.startsWith(parentPath + ".") && 
                !sortedResult.includes(childSkill)
            ) {
                sortedResult.push(childSkill);
            }
        });
    });

    return sortedResult;
  }

  appendQuickViewContent() {
    const skillsData = getListFromlocalStorage(); // Assuming this  retrieves the skills data

    if (!skillsData || skillsData.length === 0) {
      document.getElementById("quickViewContentDiv").innerHTML =
        "<br>No skills data available.";
      return;
    }
    // Group skills based on tags
    const groupedSkills = {};
    
    let sortedSkills = this.sortSkillsByTagId(skillsData);

    sortedSkills.forEach((skill, index) => {
      const tagsString = this.getTags(skill.isot_file.tags);
      if (!groupedSkills[tagsString]) {
        groupedSkills[tagsString] = [];
      }
      groupedSkills[tagsString].push({ ...skill, index });
    });

    // Append content to quickViewContentDiv
    const quickViewContentDiv = document.getElementById("quickViewContentDiv");
    quickViewContentDiv.innerHTML = "";

    for (const tagsString in groupedSkills) {
      const skillsGroup = groupedSkills[tagsString];

      const section = document.createElement("section");
      const tagElement = document.createElement("div");
      const skillsContainer = document.createElement("div");

      tagElement.className = "tag mb-2 mt-3 fw-bold";
      skillsContainer.className = "d-flex flex-wrap gap-3 mb-4";

      tagElement.innerText = tagsString;
      section.appendChild(tagElement);

      skillsGroup.forEach((skill) => {
        const skillContainer = document.createElement("div");
        skillContainer.className = "d-flex align-items-center gap-2 px-2";
        skillContainer.style =
          "font-size:14px; background-color:#F6F7F9; border-radius:10px;";
        skillContainer.style.padding = "4px 0px";

        const skillName = document.createElement("span");
        if (skill.isot_file.proxy_skill && skill.isot_file.proxy_skill.name) {
          skillName.innerHTML = skill.isot_file.proxy_skill.name;
        } else {
          skillName.innerHTML = skill.isot_file.name;
        }
        skillName.style = "font-size:16px; color:#1E1E1E";
        var percentage;
        if (skill.rating.length == 2) {
          percentage =
            ((skill.rating[1].rating - 1) /
              skill.isot_file.ratings[1].rating_scale_label.length) *
            100;
        } else {
          percentage =
            ((skill.rating[0].rating - 1) /
              skill.isot_file.ratings[0].rating_scale_label.length) *
            100;
        }

        const imagePathBase = imagePath;

        if (percentage === 25) {
          const image25 = document.createElement("img");
          image25.src = imagePathBase + "25.png";
          image25.style.width = "30px";
          image25.style.height = "30px";
          image25.style.transform = "rotate(270deg)";
          image25.style.margin = "auto";
          image25.style.display = "block";
          if (iysplugin.doughnt && tagsString != "Certifications") {
            skillContainer.appendChild(image25);
          }
        }
        if (percentage === 50) {
          const image50 = document.createElement("img");
          image50.src = imagePathBase + "50.png";
          image50.style.width = "30px";
          image50.style.height = "30px";
          image50.style.margin = "auto";
          image50.style.display = "block";
          if (iysplugin.doughnt && tagsString != "Certifications") {
            skillContainer.appendChild(image50);
          }
        }
        if (percentage === 75) {
          const image75 = document.createElement("img");
          image75.src = imagePathBase + "75.png";
          image75.style.width = "30px";
          image75.style.height = "30px";
          image75.style.margin = "auto";
          image75.style.display = "block";
          if (iysplugin.doughnt && tagsString != "Certifications") {
            skillContainer.appendChild(image75);
          }
        }
        if (percentage === 100) {
          const image100 = document.createElement("img");
          image100.src = imagePathBase + "100.png";
          image100.style.width = "30px";
          image100.style.height = "30px";
          image100.style.margin = "auto";
          image100.style.display = "block";
          if (iysplugin.doughnt && tagsString != "Certifications") {
            skillContainer.appendChild(image100);
          }
        }
        skillContainer.appendChild(skillName);
        //comments is present to show the comment
        if (skill.rating[0].comment) {
          const commentImage = document.createElement("img");
          commentImage.src = `${imagePath}Group 148.svg`;
          commentImage.className = "comment-image ms-1";
          commentImage.title = skill.rating[0].comment;
          commentImage.style.cursor = "pointer";
          commentImage.style.position = "relative";
          skillContainer.appendChild(commentImage);
        }
        const deleteIcon = document.createElement("img");
        deleteIcon.src = `${imagePath}Group 34.svg`;
        deleteIcon.style = "height:14px; width: 12px;";
        deleteIcon.setAttribute("data-mdb-tooltip-init", "");
        deleteIcon.style.backgroundColor = "#EEEEEE";
        deleteIcon.setAttribute("title", "Click to Delete");
        if (iysplugin.isDelete) {
          skillContainer.appendChild(deleteIcon);
        }

        const editIcon = document.createElement("img");
        editIcon.src = `${imagePath}Group 35.svg`;
        editIcon.style = "height:14px; width: 12px;";
        editIcon.style.backgroundColor = "#EEEEEE";
        editIcon.setAttribute("data-mdb-tooltip-init", "");
        editIcon.setAttribute("title", "Click to edit");
        editIcon.setAttribute("id", skill.isot_file.path_addr);

        if (iysplugin.isEdit) {
          skillContainer.appendChild(editIcon);
        }

        editIcon.addEventListener("click", () => {

          this.changeRateModelElement(skill.isot_file);
        });

        deleteIcon.addEventListener("click", () => {

          this.deleteSkillsFromLocalStorage(skill.isot_file.path_addr);
          skillContainer.remove();
          createSelectedSkillsCount();
        });

        skillsContainer.appendChild(skillContainer);
      });

      section.appendChild(skillsContainer);
      quickViewContentDiv.appendChild(section);
    }
  }

  appendTabularViewContent() {
    const skillsData = getListFromlocalStorage(); // Assuming this function retrieves the skills data

    const noSkillsDiv = document.createElement("div");
    noSkillsDiv.style.width = "100vw";
    noSkillsDiv.style.paddingTop = "2rem";
    const noSkillsText = document.createElement("p");
    noSkillsText.innerHTML = "No skills data available.";
    noSkillsText.style.textAlign = "center";
    noSkillsText.style.fontFamily="Inter, sans-serif";  
    noSkillsText.style.fontSize = "0.9rem"; 
    noSkillsDiv.appendChild(noSkillsText)

     if (!skillsData || skillsData.length === 0) {
      document.getElementById("tabularViewContentView").appendChild(noSkillsDiv)
      return;
    }

    // Group skills based on tags
    const groupedSkills = {};

    let sortedSkills = this.sortSkillsByTagId(skillsData);

    sortedSkills.forEach((skill, index) => {
      const tagsString = this.getTags(skill.isot_file.tags);
      if (!groupedSkills[tagsString]) {
        groupedSkills[tagsString] = [];
      }
      groupedSkills[tagsString].push({ ...skill, index });
    });

    Object.keys(groupedSkills).forEach((tag) => {
      groupedSkills[tag] = this.sortByPathAddrHierarchy(groupedSkills[tag]);
    });

    const totalItems = Object.keys(groupedSkills).reduce((sum, tag) => {
      return sum + groupedSkills[tag].length;
    }, 0);
    
    const totalPages = Math.ceil(totalItems / this.ITEMS_PER_PAGE);

    const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const endIndex = startIndex + this.ITEMS_PER_PAGE;

    const pagination = document.createElement("div");
    pagination.id = "pagination";
    pagination.innerHTML = "";
    
    // Append content to tabularViewContentView
    const tabularViewContentDiv = document.getElementById(
      "tabularViewContentView"
    );
    tabularViewContentDiv.style.width = "96vw";
    tabularViewContentDiv.style.borderRadius = "1rem";


    const accordionContainer = document.createElement("div");
    accordionContainer.className = "accordion";
    accordionContainer.style = "border-radius:1rem";
    accordionContainer.innerHTML = "";
    const accordionIdPrefix = "accordion";

    let accordionIndex = 1;
    let count = 0;

    for (const tagsString in groupedSkills) {
      const skillsGroup = groupedSkills[tagsString];

      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item";

      const accordionHeader = document.createElement("h2");
      accordionHeader.className = "accordion-header";

      var categoryHeadingLabel = document.createElement("label");
      categoryHeadingLabel.textContent = tagsString;
      categoryHeadingLabel.className = "category-heading-label";

      const accordionCollapse = document.createElement("div");
      accordionCollapse.id = `${accordionIdPrefix}-collapse-${accordionIndex}`;
      accordionCollapse.className = "accordion-collapse collapse show";
      accordionCollapse.setAttribute(
        "aria-labelledby",
        `${accordionIdPrefix}-heading-${accordionIndex}`
      );

      let tagShouldBeRendered = false;

      const accordionBody = document.createElement("div");
      accordionBody.className = "accordion-body";
      accordionBody.style = "padding:0px;";
      skillsGroup.forEach((skill, index) => {
        if(count >= startIndex && count < endIndex){

        tagShouldBeRendered = true;
        const skillContainer = document.createElement("div");
        skillContainer.className =
          "skill-container-append-tabular taggedSkills d-flex flex-wrap align-items-center justify-content-between";
        skillContainer.style = "padding:1rem 25px;";
        const ratingboxContainer = document.createElement("div");
        const skillNameWrapper = document.createElement("div");
        skillNameWrapper.style.display = "flex";
        skillNameWrapper.style.flexDirection = "column";
        const skillName = document.createElement("div");
        skillName.className = "bg-";
        skillName.style.display = "flex";
        skillName.style.alignItems = "center";

        const commentImageHTML = skill.comment
          ? `<img src="${imagePath}Group 148.svg" class="comment-image ms-1" style="cursor:pointer;">`
          : "";

        if (skill.isot_file.proxy_skill && skill.isot_file.proxy_skill.name) {
          skillName.innerHTML =
            `${skill.isot_file.proxy_skill.name} ${commentImageHTML}${
              getExpertiseLevel(skill.rating, skill.isot_file.ratings) || ""
            }` || "Skill Name Not Available";
        } else {
          skillName.innerHTML =
            `${skill.isot_file.name} ${commentImageHTML}${
              getExpertiseLevel(skill.rating, skill.isot_file.ratings) || ""
            }` || "Skill Name Not Available";
        }

        const experienceYear = document.createElement("div");
        experienceYear.className = "experience-year";
        experienceYear.style="color:#414141; width: 5rem;";
        experienceYear.style.fontFamily="Inter, sans-serif";  
        experienceYear.style.fontSize = "0.75rem";

        const skillDetails = document.createElement("div");
        skillDetails.className = "d-flex skill-details-wrapper";
        skillDetails.style.alignItems = "center";
        skillDetails.style.justifyContent = "center";
        skillDetails.style.gap = "1rem";

        const experienceDetails = document.createElement("div");
        experienceDetails.className = "pr-3";
        experienceDetails.style="color:#414141;";
        experienceDetails.style.fontSize = "0.75rem"; 
        let ratingValue = 0;
        let ratingLabel = "";
        let showCalendarIcon = false;

        if (skill.rating && skill.rating.length > 0) {
          let ratingIndex = skill.rating.length === 2 ? 1 : 0;
          let ratingScale = skill.isot_file?.ratings?.[ratingIndex]?.rating_scale_label || [];
          let isCertification = skill.isot_file.tags?.some(tag => tag.title === "Certifications");
      
          ratingValue = (skill.rating[ratingIndex]?.rating);
      
          if (isCertification && ratingScale.length === 2) {
              ratingLabel = ratingValue === 1 ? ratingScale[0] : "";
          } else if (ratingValue > 0) {
              // Default behavior for other skills
              ratingLabel = `${ratingScale[ratingValue - 2]}` || "";
              showCalendarIcon = skill.isot_file?.ratings?.[ratingIndex]?.rating_category === "Experience Level";
          }
        }

        // experienceYear.textContent = ratingLabel;
        if(ratingLabel){
          experienceYear.innerHTML = showCalendarIcon ? `${ratingLabel}` : "";
        }

        if (ratingLabel) {
          experienceDetails.innerHTML = showCalendarIcon
              ? ""
              : `${ratingLabel}`;
        } else {
            experienceDetails.style.display = 'none';
        }


        let percentage = 0;
        if (skill.rating && skill.rating.length > 0) {
            let ratingIndex = skill.rating.length === 2 ? 1 : 0;

            if (skill.rating[ratingIndex] && skill.isot_file?.ratings?.[ratingIndex]) {
                let ratingValue = skill.rating[ratingIndex].rating;
                let ratingScaleLabels = skill.isot_file.ratings[ratingIndex].rating_scale_label;
                let isCertification = skill.isot_file.tags?.some(tag => tag.title === "Certifications");

                if (isCertification && skill.isot_file.ratings[ratingIndex].rating_scale_type === "Two Choice Rating") {
                    percentage = (ratingValue === 1) ? 100 : 0;
                } else {
                    let ratingScaleLength = ratingScaleLabels.length;
                    if (ratingScaleLength > 0) {
                        percentage = ((ratingValue - 1) / ratingScaleLength) * 100;
                    }
                }
            }
        }

        const imagePathBase = imagePath;

        const ratingDetails = document.createElement("div");
        ratingDetails.className = "px-2 my-skills-px-2";
        ratingDetails.style.width = "4rem";

        const imageMap = {
          25: "firstRing.png",
          50: "secondRing.png",
          75: "thirdRing.png",
          100: "forthRing.png"
        };

        const colorMap = {
          25: "#FF56E3",   
          50: "#F29B06",   
          75: "#FFBAF5",  
          100: "#3F5AF7"  
        };

        const imageSrc = imageMap[percentage];
        const badgeColor = colorMap[percentage] || "black";

        // create wrapper
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.width = "30px";
        wrapper.style.height = "30px";

        // create image
        const image = document.createElement("img");
        image.src = imagePath + imageSrc;
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.display = "block";

        // create badge
        const badge = document.createElement("div");
        badge.textContent = percentage + "%";

        badge.style.position = "absolute";
        badge.style.top = "50%";
        badge.style.left = "50%";
        badge.style.transform = "translate(-50%, -50%)";

        badge.style.width = "16px";
        badge.style.height = "16px";
        badge.style.background = "white";
        badge.style.color = badgeColor;
        badge.style.fontSize = "8px";
        badge.style.fontWeight = "bold";
        badge.style.borderRadius = "50%";

        badge.style.display = "flex";
        badge.style.alignItems = "center";
        badge.style.justifyContent = "center";

        // append
        wrapper.appendChild(image);
        wrapper.appendChild(badge);

        if(percentage > 0){
          ratingDetails.appendChild(wrapper);
        }

        const actionsIconDiv = document.createElement("div");
        actionsIconDiv.className = "actiondiv";
        actionsIconDiv.style ="display:flex; align-items:center; width: 3rem";

        const deleteIcon = document.createElement("img");
        deleteIcon.src = `${imagePath}deleteIcon.png`;
        deleteIcon.id = "delete-icon";
        deleteIcon.style = "height:1rem; width: 1rem; cursor:pointer; margin-right:10px;";
        deleteIcon.setAttribute("data-mdb-tooltip-init", "");
        deleteIcon.setAttribute("title", "Click to Delete");
        if (iysplugin.isDelete) {
          actionsIconDiv.appendChild(deleteIcon);
        }
        
        deleteIcon.addEventListener("click", () => {

          this.deleteSkillsFromLocalStorage(skill.isot_file.path_addr);  
          const tooltipInstance = mdb.Tooltip.getInstance(deleteIcon);
          if (tooltipInstance) {
            tooltipInstance.dispose();
          }

          deleteIcon.remove();
          skillContainer.remove();
          this.updateProfileData();
          createSelectedSkillsCount();
          window.parent.postMessage(
            { type: 'DELETE_ICON_CLICKED' },
            '*'
          );
        });

        if(percentage <= 0){
          const rateIcon = document.createElement("button");
          rateIcon.textContent = "Rate";
          rateIcon.style.border = "1px solid #B8C3FF";
          rateIcon.style.backgroundColor = "white";
          rateIcon.style.padding = "0.2rem 0.9rem";
          rateIcon.style.borderRadius = "2rem";
          rateIcon.style.fontFamily = "Inter, sans-serif";
          rateIcon.style.fontWeight = "500";
          rateIcon.style.fontSize = "0.85rem";
          rateIcon.style.color = "#3F5AF7";
          rateIcon.setAttribute("id", skill.isot_file.path_addr);
          actionsIconDiv.appendChild(rateIcon);

          rateIcon.addEventListener("click", () => {
            rateIcon.style.display = "none";
            document.querySelectorAll(".rating-box").forEach((box) => {
              box.style.display = "none";
            });
          
            let ratingBox = this.createRatingBoxSearchPage(skill.isot_file, "", rateIcon, skillName, skillContainer );
            ratingboxContainer.innerHTML = "";
            ratingboxContainer.appendChild(ratingBox);
            ratingBox.style.display = "block";
          });
        }
        else{
          const editIcon = document.createElement("img");
          editIcon.src = `${imagePath}editIcon.png`;
          editIcon.className = "edit-icon";
          editIcon.style = "height:1rem; width: 1rem; cursor:pointer;";
          editIcon.setAttribute("data-mdb-tooltip-init", "");
          editIcon.setAttribute("title", "Click to edit");
          editIcon.setAttribute("id", skill.isot_file.path_addr);

          editIcon.addEventListener("click", () => {
            document.querySelectorAll(".rating-box").forEach((box) => {
              box.style.display = "none";
            });
            let ratingBox = this.createRatingBoxSearchPage(skill.isot_file, "",editIcon, skillName, skillContainer);
            ratingboxContainer.innerHTML = "";
            ratingboxContainer.appendChild(ratingBox);
  
  
            // Toggle visibility
            ratingBox.style.display = "block";
          });

          if (iysplugin.isEdit) {
            actionsIconDiv.appendChild(editIcon);
          }
        }


        // Mobile View 
        const mobileActions = document.createElement('div');
        mobileActions.className = 'mobile-actions';
        
        
        // Three-dot button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-btn';
        menuBtn.innerHTML = '⋮';
        
        
        // Dropdown
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu-btn';

         // Delete text button
        const deleteTextBtn = document.createElement('button');
        deleteTextBtn.textContent = 'Delete';
        if (iysplugin.isDelete) {
          dropdownMenu.appendChild(deleteTextBtn);
        }
        
        deleteTextBtn.addEventListener('click', () => {

          this.deleteSkillsFromLocalStorage(skill.isot_file.path_addr);  
          const tooltipInstance = mdb.Tooltip.getInstance(deleteIcon);
          if (tooltipInstance) {
            tooltipInstance.dispose();
          }

          deleteIcon.remove();
          skillContainer.remove();
          this.updateProfileData();
          createSelectedSkillsCount();
          dropdownMenu.classList.remove('show');
        });

        if(percentage <= 0){
          const rateTextBtn = document.createElement('button');
          rateTextBtn.textContent = 'Rate';
          dropdownMenu.appendChild(rateTextBtn);

          rateTextBtn.addEventListener("click", () => {
            rateTextBtn.style.display = "none";
            document.querySelectorAll(".rating-box").forEach((box) => {
              box.style.display = "none";
            });
          
            let ratingBox = this.createRatingBoxSearchPage(skill.isot_file, "", rateTextBtn, skillName, skillContainer );
            ratingboxContainer.innerHTML = "";
            ratingboxContainer.appendChild(ratingBox);
            ratingBox.style.display = "block";
            dropdownMenu.classList.remove('show');
          });

        } else {
          const editTextBtn = document.createElement('button');
          editTextBtn.textContent = 'Edit';
          
          editTextBtn.addEventListener('click', () => {
            document.querySelectorAll(".rating-box").forEach((box) => {
              box.style.display = "none";
            });
            let ratingBox = this.createRatingBoxSearchPage(skill.isot_file, "",editTextBtn, skillName, skillContainer);
            ratingboxContainer.innerHTML = "";
            ratingboxContainer.appendChild(ratingBox);
  
            // Toggle visibility
            ratingBox.style.display = "block";
            dropdownMenu.classList.remove('show');
          });
          if (iysplugin.isEdit) {
            dropdownMenu.appendChild(editTextBtn);
          }
        }

        // Toggle dropdown
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
        
        // Prevent closing when clicking inside menu
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

            
        // Add to mobile container
        mobileActions.appendChild(menuBtn);
        mobileActions.appendChild(dropdownMenu);

        skillDetails.appendChild(actionsIconDiv);
        skillDetails.appendChild(mobileActions);
      
        if (skill.rating && skill.rating.length > 0 && skill.rating[0]?.rating !== undefined) {
        
          if (iysplugin.doughnt) {
              skillDetails.prepend(ratingDetails);
          }

          if (iysplugin.experience) {

            const mediaQuery = window.matchMedia('(max-width: 768px)');

            function handleScreen(e) {
              if (e.matches) {
                ratingDetails.appendChild(experienceDetails);
              } else {
                skillDetails.insertBefore(experienceDetails, actionsIconDiv);
              }
            }
    
            // Run immediately
            handleScreen(mediaQuery);
    
            // Listen for future screen changes
            mediaQuery.addEventListener('change', handleScreen);
          }

        }

        const commentDiv = document.createElement("div");
        commentDiv.className = "comment-div mb-1";
        commentDiv.style.display = "none";
        commentDiv.style.width = "100%";
        commentDiv.style.padding = "5px 10px";
        commentDiv.style.backgroundColor = "#FF6692";
        commentDiv.style.color = "#F6F7F9";
        if (skill.rating && skill.rating.length > 0 && skill.rating[0]?.comment) {
          commentDiv.innerHTML = skill.rating[0].comment;
        } else {
          commentDiv.innerHTML = "";
        }

        // Add event listener to toggle comment visibility
        if (skill.comment) {
          skillName
            .querySelector(".comment-image")
            .addEventListener("click", () => {
              commentDiv.style.display =
                commentDiv.style.display === "none" ? "block" : "none";
            });
        }

        skillNameWrapper.appendChild(skillName);
        skillContainer.appendChild(skillNameWrapper);
        skillContainer.appendChild(skillDetails);
        skillContainer.appendChild(commentDiv);

        const mediaQuery = window.matchMedia('(max-width: 768px)');

        function handleScreen(e) {
          if (e.matches) {
            skillNameWrapper.appendChild(experienceYear);
          } else {
            skillDetails.prepend(experienceYear);
          }
        }

        // Run immediately
        handleScreen(mediaQuery);

        // Listen for future screen changes
        mediaQuery.addEventListener('change', handleScreen);

        deleteIcon.addEventListener("click", () => {

          this.deleteSkillsFromLocalStorage(skill.isot_file.path_addr);
          skillContainer.remove();
          this.updateProfileData();
          createSelectedSkillsCount();
        });

        accordionBody.appendChild(skillContainer);
        accordionBody.appendChild(ratingboxContainer);
        }
        count++;
      });

      if (tagShouldBeRendered) {
        accordionHeader.appendChild(categoryHeadingLabel);
        accordionItem.appendChild(accordionHeader);
        accordionCollapse.appendChild(accordionBody);
        accordionItem.appendChild(accordionCollapse);
        accordionContainer.appendChild(accordionItem);
      }

      accordionIndex++;
      if (count >= endIndex) break;
    }

    setTimeout(() => {
      const firstHeader = document.querySelector(".accordion-item:first-child > .accordion-header");
      firstHeader.style.paddingRight =  '2rem';
      const extraDiv = document.createElement("div");

      const div1 = document.createElement("div");
      div1.innerText = "Result";
      div1.classList.add("mb-style");
      div1.style.width = "4rem";

      const div2 = document.createElement("div");
      div2.innerText = "Description";
      div2.classList.add("hide-div");
      div2.style.width = "12rem";

      const div3 = document.createElement("div");
      div3.style.width = "3rem";

      extraDiv.style.display = "flex";
      extraDiv.style.gap = "8px";
      extraDiv.style.color = "#717680";
      extraDiv.style.fontFamily="Inter, sans-serif";  
      extraDiv.style.fontSize = "0.75rem";
      
      extraDiv.appendChild(div1);
      extraDiv.appendChild(div2);
      extraDiv.appendChild(div3);
      
      firstHeader?.appendChild(extraDiv);

    }, 100);

    // Append the generated content to the tabularViewContentView div
    tabularViewContentDiv.innerHTML = "";
    tabularViewContentDiv.appendChild(accordionContainer);

    const paginationWrapper = document.createElement("div")
    paginationWrapper.style.display = "flex"
    paginationWrapper.style.justifyContent = "space-between"
    paginationWrapper.style.alignItems = "center"

    const paginationBtnWrapper = document.createElement("div");
    paginationBtnWrapper.id = "pagination-btn-wrapper";
    
    const prev = document.createElement("button")
    prev.className = "pagination-txt-info pagination-btn";
    const next = document.createElement("button")
    next.className = "pagination-txt-info pagination-btn";
    const info = document.createElement("div")
    info.className = "pagination-txt-info";
    
    prev.textContent = "Previous"
    next.textContent = "Next"
    info.textContent = `Page ${this.currentPage} of ${totalPages}`;

     prev.disabled = this.currentPage === 1;
     next.disabled = this.currentPage === totalPages;


      prev.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--
        this.appendTabularViewContent()
      }
    }
    
    next.onclick = () => {
      if (this.currentPage < totalPages) {
        this.currentPage++
        this.appendTabularViewContent()
      }
    }

    paginationBtnWrapper.appendChild(prev);
    paginationBtnWrapper.appendChild(next);
    paginationWrapper.appendChild(paginationBtnWrapper)
    paginationWrapper.appendChild(info);

    pagination.appendChild(paginationWrapper)


    tabularViewContentDiv.appendChild(pagination)

    const profileBtnWrapper = document.createElement("div");
    profileBtnWrapper.style.display = "flex";
    profileBtnWrapper.style.justifyContent = "flex-end";
    
    const skills = JSON.parse(localStorage.getItem("logginUserRatedSkills") || "[]");

    if (skills.length > 0) {

      const saveProfileButton = document.createElement("button");
      saveProfileButton.className = "save-profile-btn";
      saveProfileButton.textContent = "Save Profile";
  
      saveProfileButton.onclick = async () => {
  
        const transformSkillList = transformDataFromLocalStorage(
          skills
        );
  
        if (transformSkillList?.skills?.length > 0) {
          try {
            saveProfileButton.disabled = true;
            saveProfileButton.textContent = "Saving...";
            fetch(loggedInUserAddSkill, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getAccessToken.access}`,
              },
              body: JSON.stringify(transformSkillList),
            }).then(async (response) => {
              // Handle the response from the server
              if (response.ok) {
                clearlocalStorage();
                await getListFromLoggedInUser();
                this.updateProfileData();
              } else {
                // Handle errors
                console.error(
                  "Failed to add skill:",
                  response.status,
                  response.statusText
                );
              }
            });
            saveProfileButton.textContent = "Saved";
          } catch (error) {
            saveProfileButton.textContent = "Failed";
            console.error(error);
          } finally {
            setTimeout(() => {
              saveProfileButton.disabled = false;
              saveProfileButton.textContent = "Save";
            }, 1500);
          }
        }
      };
  
      profileBtnWrapper.appendChild(saveProfileButton);
      tabularViewContentDiv.appendChild(profileBtnWrapper);
    }
    
    }



  softLanguageProficiencySkillAPI() {
    let skillId = "files/a54b2fe8-dfce-4ff8-977d-af63d7777e89";
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-child/?path_addr=" + skillId;
    } else {
      url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
    }
    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "limit-exceeded.html";
        } else {
          return response.json();
        }
      })
      .then((response) => {
        console.warn("children", response, this.softSkillCard);
        this.createSkillSearchButtonList(this.softSkillCard, response, true);

      })
      .catch((err) => console.error(err));
  }

  ExperienceProfileAPI() {
    let skillId = "files/fe2f048a-aa8c-4e16-9f51-378a18a2b17a";
    let url = "";
    if (isLoginUser) {
      url = window.location.origin + "/api-child/?path_addr=" + skillId;
    } else {
      url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
    }
    fetch(url, this.rapidAPIheaders)
      .then((response) => {
        if (response.status === 429) {
          // Redirect to /limit-exceeded/ page
          window.location.href = "limit-exceeded.html";
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

      })
      .catch((err) => console.error(err));
  }

  deleteSkillsFromLocalStorage(pathAddr) {
    if (!isLoginUser) {
      let userRatedSkills = JSON.parse(
        localStorage.getItem("userRatedSkills", "[]")
      );
      // Find the index of the skill with the matching path_addr
      const skillIndex = userRatedSkills.findIndex(skill => skill.isot_file.path_addr === pathAddr);
      if (skillIndex > -1) {
        // Remove the skill from the array
        userRatedSkills.splice(skillIndex, 1);
        localStorage.setItem("userRatedSkills", JSON.stringify(userRatedSkills));
        this.updateProfileData();
      }
    } else {
      let userRatedSkills = getListFromlocalStorage();
      const skillIndex = userRatedSkills.findIndex(skill => skill.isot_file.path_addr === pathAddr);

      if (skillIndex > -1) {
        if (localStorage.getItem("logginUserRatedSkills")) {
          let removedElement = userRatedSkills.splice(skillIndex, 1);

          let url = `${deleteSkillApiEndpoint}${removedElement[0].id}/`;
          console.warn("url", url);

          fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAccessToken?.access}`,
            },
          })
          .then((response) => {
            if (response.status === 429) {
              window.location.href = "limit-exceeded.html";
            } else {
              return response.json();
            }
          })
          .then(async (response) => {
            localStorage.setItem(
              "logginUserRatedSkills",
              JSON.stringify(userRatedSkills)
            );
            this.updateProfileData();
          });
        } else {
          userRatedSkills.splice(skillIndex, 1);
          localStorage.setItem("userRatedSkills", JSON.stringify(userRatedSkills));
        }
        this.updateProfileData();
      }
    }
  }

  childrenSkillAPI(skillName, skillId, identifier, parentIdOfHirarchy = "", highlightSkill, clickedSkillParentName, clickedSkillParenId, breadcrumbPath) {
    let pathAddr = clickedSkillParenId && clickedSkillParenId !== "" ? clickedSkillParenId : skillId;
    const skillIdElement = document.getElementById(
      parentIdOfHirarchy !== "" ? parentIdOfHirarchy : skillId
    );
    const selectedSkillDiv = document.querySelector(".card-title");

    const loader = document.createElement("div");
    loader.className = "loader";
    loader.style.margin = "100px auto";

    let parentBreadcrumbPath = [];

    if (breadcrumbPath && Array.isArray(breadcrumbPath) && breadcrumbPath.length > 0) {
      breadcrumbPath.forEach((item) => {
          parentBreadcrumbPath.push({
              name: item.name,
              path_addr: item.path_addr,
              ratings: item.ratings,
          });
      });
    }
    
    if (skillIdElement) {

      let url = isLoginUser
        ? `https://api.myskillsplus.com/api-child/?path_addr=${pathAddr}`
        : `${ENDPOINT_URL}children/?path_addr=${pathAddr}`;

      const cardbodyaccordion = document.getElementById("card-body-accordion")
      const loader = document.createElement("div");
      loader.className = "loader";
      cardbodyaccordion.appendChild(loader);

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken?.access}`,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            window.location.href = "limit-exceeded.html";
          } else {
            return response.json();
          }
        })
        .then((response) => {

          const skillsWithTwoTags = response.filter(
            (skill) => skill.tags.length === 2
          );
          const otherSkills = response.filter(
            (skill) => skill.tags.length !== 2
          );

          if (otherSkills.length > 0 || skillsWithTwoTags.length > 0) {
            this.createSelectSkillsChildBox(
              skillName,
              this.cardBodyDiv,
              response,
              identifier,
              skillId,
              parentBreadcrumbPath,
              "",
              highlightSkill,
              clickedSkillParentName,
              clickedSkillParenId
            );
          }
        })
        .catch((err) => {
          console.error(err);
          skillIdElement.innerHTML = previousContent;
        }).finally(() => {
            cardbodyaccordion.removeChild(loader);
        });
    } else {

      const cardBodySearch = document.querySelector(".card-body-search");
      cardBodySearch.style.display = "block";
      const loader = document.createElement("div");
      loader.className = "loader";
      cardBodySearch.appendChild(loader);

      let url = isLoginUser
        ? `https://api.myskillsplus.com/api-child/?path_addr=${pathAddr}`
        : `${ENDPOINT_URL}children/?path_addr=${pathAddr}`;

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken?.access}`,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            window.location.href = "limit-exceeded.html";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          if (response.length > 0) {
            this.createSelectSkillsChildBox(
              skillName,
              this.cardBodyDiv,
              response,
              identifier,
              skillId,
              parentBreadcrumbPath,
              "",
              highlightSkill,
              clickedSkillParentName,
              clickedSkillParenId
            );
          }
        })
        .catch((err) => {
          selectedSkillDiv.innerHTML = previousContent;
          console.error(err);
        }).finally(() => {
          cardBodySearch.removeChild(loader);
        });
    }
  }

  updateProfileData() {

    const existingColors = [];
    var buttons = document.getElementsByClassName("random-color-button");

    for (var i = 0; i < buttons.length; i++) {
      const randomColor = getRandomColor(existingColors);
      const randomColorWithOpacity = addLightOpacity(randomColor, 0.1);

      buttons[i].style.color = `${randomColor}`;
      buttons[i].style.border = `1px solid ${randomColor}`;
      buttons[i].style.background = randomColorWithOpacity;
    }
    applyRandomColor(buttons);
    this.appendTabularViewContent();
  }

  getTags(tags) {
    const aliasMap = {
      "Area": "Career Domain",
      "Focus Area, Specialization": "Focus Area, Specialization",
      "Domain": "Contextual Dimensions",
      "Role": "Role",
      "Concepts": "Knowledge (of concepts, methods, processes etc.)",
      "Applied Skills": "Applied Skills",
      "Tools": "Tools, Technologies, Applications",
      "Certifications": "Certifications",
      "Machinery": "Machinery",
      "Responsibilities": "Responsibilities",
      "Personal Attributes": "Personal Attributes",
      "Language Proficiency": "Language Proficiency",
      "Master": "Master",
      "Learning": "Learning",
      "Function": "Function"
    };
  
    const priority = [
      "Area",
      "Role",
      "Concepts",
      "Applied Skills",
      "Tools",
      "Responsibilities",
      "Certifications",
      "Personal Attributes",
      "Language Proficiency",
      "Function",
      "Domain",
      "Focus Area, Specialization",
      "Machinery",
      "Master",
      "Learning"
    ];

    if (!tags || tags.length === 0) return "Other";

    // Choose the tag with the highest priority
    let selectedTag = tags.reduce((prev, curr) => {
      const prevIndex = priority.indexOf(prev.title);
      const currIndex = priority.indexOf(curr.title);
      if (currIndex !== -1 && (prevIndex === -1 || currIndex < prevIndex)) {
        return curr;
      }
      return prev;
    });

    const title = selectedTag?.title || "";
    return aliasMap[title] || title;
  }  

  treeSkillAPI(skillName, cardBodyDiv, skillId) {
    
    let url = "";
    if (isLoginUser) {
      url = `https://api.myskillsplus.com/api-tree/?path_addr=${skillId}`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken?.access}`,
        },
      })
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "limit-exceeded.html";
          } else {
            return response.json();
          }
        })
        .then((response) => {

          if (response.ancestors.length > 1) {
            let breadcrumbStartIndex = response.ancestors.map(skill => skill.is_discrete).lastIndexOf(1);
            let breadcrumbPath = response.ancestors.slice(breadcrumbStartIndex);
            let lastAncestor = response.ancestors[response.ancestors.length - 1];  // Last ancestor
            let secondLastAncestor = response.ancestors[response.ancestors.length - 2];  // Second last ancestor
            let parentOfLastAncestor = null;  
            if (lastAncestor && lastAncestor.is_discrete === 1) {
                parentOfLastAncestor = "";
            } else {
                parentOfLastAncestor = secondLastAncestor || "";
            }

            this.childrenSkillAPI(
              lastAncestor["name"],
              lastAncestor["path_addr"],
              "",
              "",
              skillName,
              parentOfLastAncestor["name"],
              parentOfLastAncestor["path_addr"],
              breadcrumbPath
            );
          } else {
            this.childrenSkillAPI(skillName, skillId);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      url = `${ENDPOINT_URL}tree/?path_addr=${skillId}`;
      fetch(url, this.rapidAPIheaders)
        .then((response) => {
          if (response.status === 429) {
            // Redirect to /limit-exceeded/ page
            window.location.href = "limit-exceeded.html";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          if (response.ancestors.length > 1) {
            let breadcrumbStartIndex = response.ancestors.map(skill => skill.is_discrete).lastIndexOf(1);
            let breadcrumbPath = response.ancestors.slice(breadcrumbStartIndex);
            let lastAncestor = response.ancestors[response.ancestors.length - 1];  // Last ancestor
            let secondLastAncestor = response.ancestors[response.ancestors.length - 2];  // Second last ancestor
            let parentOfLastAncestor = null;  
            parentOfLastAncestor = "";
            this.childrenSkillAPI(
              lastAncestor["name"],
              lastAncestor["path_addr"],
              "",
              "",
              skillName,
              parentOfLastAncestor["name"],
              parentOfLastAncestor["path_addr"],
              breadcrumbPath
            );
          } else {
            this.childrenSkillAPI(skillName, skillId);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  // New skills add functionality
  handleHardSkillsClick() {
    var imgBodyDiv = $(".img-body");
    var cardBodyDetail = $(".card-body");
    var softSkillDescription = $(".softSkillDescription");
    var softSkillDetail = $(".softskillaccordian");
    var roleDetail = $(".roleaccordian");
    var skillGroupDescription = $(".skillgroupdescription");
    var dropdownMenu = $(".dropdown-menu");
    imgBodyDiv.css("display", "none");
    cardBodyDetail.css("display", "");
    softSkillDescription.css("display", "none");
    softSkillDetail.css("display", "none");
    roleDetail.css("display", "none");
    skillGroupDescription.css("display", "none");
    dropdownMenu.css("display", "none");
  }

  async handleRoleClick() {
    var imgBodyDiv = $(".img-body");
    var cardBodyDetail = $(".card-body");
    var softSkillDescription = $(".softSkillDescription");
    var softSkillDetail = $(".softskillaccordian");
    var roleDetail = $(".roleaccordian");

    imgBodyDiv.css("display", "none");
    cardBodyDetail.css("display", "none");
    softSkillDescription.css("display", "none");
    softSkillDetail.css("display", "none");
    roleDetail.css("display", "");

    var roleaccordian = document.getElementById("roleaccordian");
    if (roleaccordian) {
      await this.fetchParentRoleSkills(roleaccordian);
    } else {
      console.error('Element with ID "roleaccordian" not found.');
    }
  }

  async handleSoftSkillsClick() {
    var imgBodyDiv = $(".img-body");
    var cardBodyDetail = $(".card-body");
    var softSkillDescription = $(".softSkillDescription");
    var softSkillDetail = $(".softskillaccordian");
    var roleDetail = $(".roleaccordian");
    var skillGroupDescription = $(".skillgroupdescription");

    imgBodyDiv.css("display", "none");
    cardBodyDetail.css("display", "none");
    softSkillDescription.css("display", "");
    softSkillDetail.css("display", "");
    roleDetail.css("display", "none");
    skillGroupDescription.css("display", "none");

    var softskillaccordian = document.getElementById("softskillaccordian");

    if (softskillaccordian) {
      if (softskillaccordian.children.length === 0) {
        await this.fetchParentSoftSkills(softskillaccordian);
      }
    } else {
      console.error('Element with ID "softskillaccordian" not found.');
    }
  }

  async fetchParentSoftSkills(softSkillAccordian) {
    const parentSkillApiEndpoint = `${ENDPOINT_URL}soft-skills/`;

    try {
      const response = await fetch(parentSkillApiEndpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch parent soft skills");
      }
      const parentSkills = await response.json();
      const skillsWithTwoTags = parentSkills.filter(
        (skill) => skill.tags.length === 2
      );
      const otherSkills = parentSkills.filter(
        (skill) => skill.tags.length !== 2
      );
      if (otherSkills.length > 0) {
        this.renderSkills(parentSkills, [], softSkillAccordian);
      }
      else if (skillsWithTwoTags.length > 0) {
        this.CategorySoftSkills(
          softSkillAccordian,
          skillsWithTwoTags,
          "",
          "",
        );
      }
      // Render parent skill buttons
    } catch (error) {
      console.error("Error fetching parent soft skills:", error);
    }
  }

  async fetchParentRoleSkills(softSkillAccordian) {
    const parentSkillApiEndpoint = `${ENDPOINT_URL}role/`;

    try {
      const response = await fetch(parentSkillApiEndpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch parent soft skills");
      }
      const parentSkills = await response.json();

      // Render parent skill buttons
      this.renderSkills(parentSkills, [], softSkillAccordian);
    } catch (error) {
      console.error("Error fetching parent soft skills:", error);
    }
  }

  async fetchSkillsAsync(apiEndpoint) {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch skills");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  }

  addHoverStyles = (element,hoverCircleImg) => {
    element.addEventListener("mouseover", () => {
      element.style.backgroundColor = "#1abc9c"; 
      element.style.color = "#4f4f4f";

      if(hoverCircleImg){
        hoverCircleImg.style.filter = 'brightness(0.7)'; // Increase brightness
      }

    });
  
    element.addEventListener("mouseout", () => {
      element.style.backgroundColor = "#FFFFFF";
      element.style.color = "#4f4f4f";
      element.style.fontWeight = "500";

      if (hoverCircleImg) {
        hoverCircleImg.style.filter = 'none'; // Remove Brightness
      }

    });
  };

  renderSkills(skills, breadcrumbPath, softSkillAccordian) {
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }

    // Clear existing content in softSkillAccordian before appending new content
    softSkillAccordian.innerHTML = "";

    // Render breadcrumb
    this.renderBreadcrumb(skills, breadcrumbPath, softSkillAccordian);
    skills.sort(
      (a, b) =>
        (a.display_order !== null ? a.display_order : Infinity) -
        (b.display_order !== null ? b.display_order : Infinity)
    );
    // Create buttons for each skill
    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("softskillparentaccordian");
    skillsContainer.setAttribute("id", "softskillparentaccordian");
    skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");

    skills.forEach((skill) => {
      const skillButton = document.createElement("button");
      skillButton.className = "softskillbutton";
      skillButton.setAttribute("id", skill.path_addr + "button");
      skillButton.style.border = "1px solid #4f4f4f";
      skillButton.style.borderRadius = "20px";
      skillButton.style.margin = "5px";
      skillButton.style.padding = "6px 12px";
      skillButton.style.backgroundColor = "#FFFFFF";
      skillButton.style.cursor = "pointer";
      skillButton.style.color = "#4f4f4f";
      skillButton.style.fontWeight = "500";
      skillButton.style.fontSize = "14px";
      skillButton.setAttribute("data-mdb-tooltip-init", "");

      const hoverCircleImg = document.createElement("img");
      const descriptionImg = document.createElement("img");

      this.addHoverStyles(skillButton,hoverCircleImg);

      const childCount = skill.child_count || 0;
      const ratingsCount = skill.ratings ? skill.ratings.length : 0;
      const description = skill.description;

      const buttonContentDiv = document.createElement("div");
      buttonContentDiv.setAttribute("id", skill.path_addr + "div");
      buttonContentDiv.style =
        "display:flex; align-items:center; justify-content:center;";

      const skillNameSpan = document.createElement("span");
      skillNameSpan.textContent = skill.name;
      if (skill.name.length > 40) {
        skillNameSpan.classList.add("truncate");
        if(skill.proxy_skill){
          manageTooltip(skillNameSpan, skill.proxy_skill.name);
          manageTooltip(descriptionImg,description);
        }
        else{
          manageTooltip(skillNameSpan, skill.name);
          manageTooltip(descriptionImg,description);
        }
      }else if (skill.proxy_skill){
        manageTooltip(skillNameSpan, skill.proxy_skill.name);
        manageTooltip(descriptionImg,description);
      }
      else{
        manageTooltip(skillNameSpan,description);
      }

      if (description) {
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        descriptionImg.style.marginRight = "10px";
        descriptionImg.style.width = "18px";
        descriptionImg.style.height = "18px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);

      if (childCount > 0) {
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        var tooltip = `${childCount} sub categories`;
        hoverCircleImg.style.marginLeft = "5px";
        buttonContentDiv.appendChild(hoverCircleImg);
        manageTooltip(hoverCircleImg, tooltip);
      }

      if (ratingsCount > 0) {
        const searchText = searchByName(skill.name,skill.path_addr);
        if (searchText.length > 0) {
          const starIcon = document.createElement("img");
          starIcon.src = `${imagePath}Group 23.svg`;
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            this.changeRateModelElement(skill);
          });
          skillButton.classList.add('rated-skill');
          buttonContentDiv.appendChild(starIcon);
        } else {
          const starIcon = document.createElement("i");
          starIcon.setAttribute("id", skill.path_addr);
          starIcon.className = "fas fa-star";
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.style.color = "#ccccff";
          starIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            this.changeRateModelElement(skill);
          });
          buttonContentDiv.appendChild(starIcon);
        }
      }

      skillButton.appendChild(buttonContentDiv);

      // Add click event to fetch and display child skills or call changeratingmodelelement
      skillButton.addEventListener("click", async () => {
        if (skill.child_count === 0) {
          // Call changeratingmodelelement function with skill data
          this.changeRateModelElement(skill);
        } else {
          const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
          const childSkills = await this.fetchSkillsAsync(childSkillApiEndpoint);
          const newBreadcrumbPath = [
            ...breadcrumbPath,
            {
              name: skill.name,
              path_addr: skill.path_addr,
              ratings: skill.ratings,
            },
          ];

          // Render child skills
          this.renderSkills(childSkills, newBreadcrumbPath, softSkillAccordian);
        }
      });

      skillsContainer.appendChild(skillButton);
    });

    // Append skills container to accordion
    softSkillAccordian.appendChild(skillsContainer);
  }

  renderBreadcrumb(skills, breadcrumbPath, softSkillAccordian) {
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }

    // Create breadcrumb element
    const breadcrumb = document.createElement("div");
    breadcrumb.classList.add("breadcrumb");
    breadcrumb.style =
      "padding:10px; background-color:white; display:none; border-radius:5px;";

    if (breadcrumbPath.length > 0) {
      breadcrumb.style.display = "";
      const knowledgeLink = document.createElement("span");
      knowledgeLink.textContent = skills[0].tags[0].title;
      knowledgeLink.style.cursor = "pointer";
      knowledgeLink.style.color = "#A7A4DC";
      knowledgeLink.style.marginRight = "5px";
      knowledgeLink.addEventListener("click", async () => {
        const parentSkillApiEndpoint = `${ENDPOINT_URL}soft-skills/`;
        const parentSkills = await this.fetchSkillsAsync(parentSkillApiEndpoint);
        this.renderSkills(parentSkills, [], softSkillAccordian);
      });
      breadcrumb.appendChild(knowledgeLink);

      const separator = document.createElement("img");
      separator.src = `${imagePath}Group 18.svg`;
      separator.style.marginRight = "5px";
      breadcrumb.appendChild(separator);
    }

    // Create clickable breadcrumb items
    breadcrumbPath.forEach((breadcrumbItem, index) => {
      const breadcrumbLink = document.createElement("span");
      breadcrumbLink.textContent = breadcrumbItem.name;
      breadcrumbLink.style.cursor = "pointer";
      breadcrumbLink.style.color =
        index === breadcrumbPath.length - 1 ? "rgb(51, 51, 51)" : "rgb(0, 102, 204)";
      breadcrumbLink.style.fontWeight = index === breadcrumbPath.length -1 ? "bold" : "normal";
      breadcrumbLink.style.fontSize = "15px";
      breadcrumbLink.style.marginRight = "5px";

      breadcrumbLink.addEventListener("click", async () => {
        const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
        const skills = await this.fetchSkillsAsync(childSkillApiEndpoint);
        const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);
        this.renderSkills(skills, newBreadcrumbPath, softSkillAccordian);
      });

      breadcrumb.appendChild(breadcrumbLink);

      if (index < breadcrumbPath.length - 1) {
        const separator = document.createElement("img");
        separator.src = `${imagePath}Group 18.svg`;
        separator.style.marginRight = "5px";
        breadcrumb.appendChild(separator);
      }
    });

    const currentBreadcrumbItem = breadcrumbPath[breadcrumbPath.length - 1];

    if (
      currentBreadcrumbItem &&
      currentBreadcrumbItem.ratings &&
      currentBreadcrumbItem.ratings.length > 0
    ) {
      var rateButton = document.createElement("button");
      rateButton.className = "ratebutton";
      rateButton.setAttribute("id", skills.path_addr);
      rateButton.style.marginLeft = "5px";
      rateButton.style =
        "padding-top:1px; padding-bottom: 1px; border:none; border-radius:5px;";
      rateButton.style.backgroundColor = "#E0DEFF";
      rateButton.style.cursor = "pointer";

      const rateButtonSpan = document.createElement("span");

      const searchText = searchByName(currentBreadcrumbItem.name,currentBreadcrumbItem.path_addr);
      if (searchText.length > 0) {
        rateButton.style.backgroundColor = "#E0DEFF";
        rateButtonSpan.textContent = "Rated";
        rateButtonSpan.style.color = "#1E1E1E";
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 23.svg`;
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        rateButton.appendChild(starIcon);
      } else {
        rateButton.style.backgroundColor = "#EFF4FA";
        rateButtonSpan.textContent = "Rate";
        rateButtonSpan.style.color = "#636363";
        const starIcon = document.createElement("i");
        starIcon.className = "fas fa-star";
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.style.color = "rgb(204, 204, 255)";
        rateButton.appendChild(starIcon);
      }
      rateButtonSpan.style.fontSize = "16px";

      rateButton.appendChild(rateButtonSpan);
      rateButton.addEventListener("click", () => {
        this.changeRateModelElement(skills);
      });

      breadcrumb.appendChild(rateButton);
    }

    // Append breadcrumb to accordion
    softSkillAccordian.appendChild(breadcrumb);
  }

  async CategorySoftSkills(
    htmlElement,
    skillList,
    skillId,
    breadcrumbPath = [],
  ) {

    const CardBody = document.createElement("div");

    const cardBodyInnerDiv = document.createElement("div");
    cardBodyInnerDiv.style.backgroundColor = "white";
    cardBodyInnerDiv.classList.add("card-body-child-accordion");
    cardBodyInnerDiv.style.borderRadius = "10px";
    cardBodyInnerDiv.style.marginBottom = "15px";

    if (skillList.length > 0) {
      CardBody.style.backgroundColor = "white";
      CardBody.style.padding = "0 12px";
      CardBody.style.paddingBottom = "12px";
      CardBody.classList.add("card-body-accordion");
      CardBody.style.borderRadius = "10px";
      CardBody.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

      const skillsContainer = document.createElement("div");
      skillsContainer.classList.add("softskillparentaccordian");
      skillsContainer.setAttribute("id", "softskillparentaccordian");
      skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
      skillsContainer.style.textAlign = "left";

      skillList.forEach((skill) => {
        const skillButton = document.createElement("button");
        skillButton.className = "softskillbutton";
        skillButton.style.border = "2px solid #16a085";
        skillButton.style.borderRadius = "20px";
        skillButton.style.margin = "5px";
        skillButton.style.padding = "6px 12px";
        skillButton.style.background = "#FFFFFF";
        skillButton.style.cursor = "pointer";
        skillButton.style.color = "#4f4f4f";
        skillButton.style.fontWeight = "500";
        skillButton.style.fontSize = "14px";
        skillButton.setAttribute("data-mdb-tooltip-init", "");

        const childCount = skill.child_count || 0;
        const ratingsCount = skill.ratings ? skill.ratings.length : 0;
        const description = skill.description;

        const buttonContentDiv = document.createElement("div");
        buttonContentDiv.style =
          "display:flex; align-items:center; justify-content:center;";

        const skillNameSpan = document.createElement("span");
        skillNameSpan.textContent = skill.name;
        if (skill.name.length > 40) {
          skillNameSpan.classList.add("truncate");
          if(skill.proxy_skill){
            manageTooltip(skillNameSpan, skill.proxy_skill.name);
          }
          else{
            manageTooltip(skillNameSpan, skill.name);
          }
        }else if (skill.proxy_skill){
          manageTooltip(skillNameSpan, skill.proxy_skill.name);
        }

        if (description) {
          const descriptionImg = document.createElement("img");
          descriptionImg.src = `${imagePath}Group 27.svg`;
          descriptionImg.alt = "description";
          descriptionImg.style.marginRight = "10px";
          buttonContentDiv.appendChild(descriptionImg);
          manageTooltip(descriptionImg, description);
        }

        buttonContentDiv.appendChild(skillNameSpan);
        if (childCount > 0) {
          const hoverCircleImg = document.createElement("img");
          hoverCircleImg.className="hovercircle";
          hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
          hoverCircleImg.alt = "circle";
          hoverCircleImg.style.width = "20px";
          hoverCircleImg.style.height = "20px";
          const tooltip = `${childCount} sub categories`;
          hoverCircleImg.style.marginLeft = "5px";
          buttonContentDiv.appendChild(hoverCircleImg);
          manageTooltip(hoverCircleImg, tooltip);
        }

        if (ratingsCount > 0) {
          const searchText = searchByName(skill.name,skill.path_addr);
          if (searchText.length > 0) {
            const starIcon = document.createElement("img");
            starIcon.src = `${imagePath}Group 23.svg`;
            starIcon.style.marginLeft = "5px";
            starIcon.style.cursor = "pointer";
            starIcon.addEventListener("click", (event) => {
              event.stopPropagation();
              this.changeRateModelElement(skill);
            });
            buttonContentDiv.appendChild(starIcon);
            skillButton.classList.add('rated-skill');
          } else {
            const starIcon = document.createElement("i");
            starIcon.className = "fas fa-star";
            starIcon.setAttribute("id", skill.path_addr);
            starIcon.style.marginLeft = "5px";
            starIcon.style.cursor = "pointer";
            starIcon.style.color = "#ccccff";
            starIcon.addEventListener("click", (event) => {
              event.stopPropagation();
              this.changeRateModelElement(skill);
            });
            buttonContentDiv.appendChild(starIcon);
          }
        }

        skillButton.appendChild(buttonContentDiv);

        skillButton.addEventListener("click", async () => {
          const allButtons = document.querySelectorAll(".softskillbutton");
          allButtons.forEach((btn) => {
            btn.classList.remove("active-skill-button");

            const hoverCircle = btn.querySelector(".hovercircle");
            if (hoverCircle) {
                hoverCircle.style.filter = "none"; 
            }
          });
    

          // Add active class to the clicked button
          skillButton.classList.add("active-skill-button");
          const hoverCircle = skillButton.querySelector(".hovercircle");
          if (hoverCircle) {
            hoverCircle.style.filter = "brightness(0.7)"; // or remove the filter
          }

          if (skill.child_count === 0 && skill.ratings.length > 0) {
            this.changeRateModelElement(skill);
          } else {
            if (skill.child_count > 0 && skill.name !== "Related Skills") {
              const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
              const childSkills = await this.fetchSkillsAsync(childSkillApiEndpoint);
              const validChildSkills = childSkills.filter(
                (skill) => skill.name !== "Related Skills"
              );
              const newBreadcrumbPath = [
                ...breadcrumbPath,
                {
                  name: skill.name,
                  path_addr: skill.path_addr,
                  ratings: skill.ratings,
                },
              ];
              this.renderCategorySoftSkill(
                validChildSkills,
                newBreadcrumbPath,
                cardBodyInnerDiv,
              );
            }
          }
        });

        skillsContainer.appendChild(skillButton);
      });

      CardBody.appendChild(skillsContainer);
      CardBody.appendChild(cardBodyInnerDiv);
    } else {
      CardBody.innerHTML = "";
    }

    htmlElement.appendChild(CardBody);
  }

  renderCategorySoftSkill(
    skills,
    breadcrumbPath,
    softSkillAccordian,
    skillId,
    parentskills = [],
    skillName,
    highlightSkill
  ) {
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }
    // Clear existing content in softSkillAccordian before appending new content
    softSkillAccordian.innerHTML = "";

    // Render breadcrumb
    this.renderCategorySoftSkillBreadcrumb(
      skills,
      breadcrumbPath,
      softSkillAccordian,
      skillId,
      parentskills,
      skillName,
      highlightSkill
    );
    skills.sort(
      (a, b) =>
        (a.display_order !== null ? a.display_order : Infinity) -
        (b.display_order !== null ? b.display_order : Infinity)
    );
    // Create buttons for each skill
    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("softskillparentaccordian");
    skillsContainer.setAttribute("id", "softskillparentaccordian");
    skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
    skillsContainer.style.textAlign = "left";

    skills.forEach((skill) => {
      const skillButton = document.createElement("button");
      skillButton.className = "softskillbutton";
      skillButton.setAttribute("id", skill.path_addr + "button");
      skillButton.style.border = "1px solid #4f4f4f";
      skillButton.style.borderRadius = "20px";
      skillButton.style.margin = "5px";
      skillButton.style.padding = "6px 12px";
      skillButton.style.background = "#FFFFFF";
      skillButton.style.cursor = "pointer";
      skillButton.style.color = "#4f4f4f";
      skillButton.style.fontWeight = "500";
      skillButton.style.fontSize = "14px";
      skillButton.setAttribute("data-mdb-tooltip-init", "");

      const hoverCircleImg = document.createElement("img");
      const descriptionImg = document.createElement("img");

      this.addHoverStyles(skillButton,hoverCircleImg);

      if (highlightSkill && skill.name === highlightSkill) {
        hoverCircleImg.classList.add("brightened");
        skillButton.classList.add("highlighted-skill");
      }
      else{
        hoverCircleImg.classList.remove("brightened");
      }

      const childCount = skill.child_count || 0;
      const ratingsCount = skill.ratings ? skill.ratings.length : 0;
      const description = skill.description;

      const buttonContentDiv = document.createElement("div");
      buttonContentDiv.setAttribute("id", skill.path_addr + "div");
      buttonContentDiv.style =
        "display:flex; align-items:center; justify-content:center;";

      const skillNameSpan = document.createElement("span");
      skillNameSpan.textContent = skill.name;
      if (skill.name.length > 40) {
        skillNameSpan.classList.add("truncate");
        if(skill.proxy_skill){
          manageTooltip(skillNameSpan, skill.proxy_skill.name);
          manageTooltip(descriptionImg,description);
        }
        else{
          manageTooltip(skillNameSpan, skill.name);
          manageTooltip(descriptionImg,description);
        }
      }else if (skill.proxy_skill){
        manageTooltip(skillNameSpan, skill.proxy_skill.name);
        manageTooltip(descriptionImg,description);
      }
      else{
        manageTooltip(skillNameSpan,description);
      }

      if (description) {
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        descriptionImg.style.marginRight = "10px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);

      if (childCount > 0) {
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        var tooltip = `${childCount} sub categories`;
        hoverCircleImg.style.marginLeft = "5px";
        buttonContentDiv.appendChild(hoverCircleImg);
        manageTooltip(hoverCircleImg, tooltip);
      }

      if (ratingsCount > 0) {
        const searchText = searchByName(skill.name,skill.path_addr);
        if (searchText.length > 0) {
          const starIcon = document.createElement("img");
          starIcon.src = `${imagePath}Group 23.svg`;
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            this.changeRateModelElement(skill);
          });
          buttonContentDiv.appendChild(starIcon);
          skillButton.classList.add('rated-skill');
        } else {
          const starIcon = document.createElement("i");
          starIcon.className = "fas fa-star";
          starIcon.setAttribute("id", skill.path_addr);
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.style.color = "#ccccff";
          starIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            this.changeRateModelElement(skill);
          });
          buttonContentDiv.appendChild(starIcon);
        }
      }

      skillButton.appendChild(buttonContentDiv);

      skillButton.addEventListener("click", async () => {
        if (skill.child_count === 0 && skill.ratings.length > 0) {
          this.changeRateModelElement(skill);
        } else if (skill.name === "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
          const relatedSkills = await this.fetchSkillsAsync(relatedSkillApiEndpoint);
          relatedSkills.forEach((skill) => {
            if (skill.child_count === 1 && skill.ratings.length > 0) {
              skill.child_count = 0;
            }
          });
          if (relatedSkills.length > 0) {
            // Filter out skills with child_count equal to 1
            const validRelatedSkills = relatedSkills.filter(
              (relatedSkill) => relatedSkill.child_count !== 1
            );
            const newBreadcrumbPath = [
              ...breadcrumbPath,
              {
                name: skill.name,
                path_addr: skill.path_addr,
                ratings: skill.ratings,
              },
            ];
            this.renderCategorySoftSkill(
              validRelatedSkills,
              newBreadcrumbPath,
              softSkillAccordian,
              skillId,
              parentskills,
              skillName,
              highlightSkill
            );
          }
        } else {
          if (skill.child_count > 0 && skill.name !== "Related Skills") {
            const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
            const childSkills = await this.fetchSkillsAsync(childSkillApiEndpoint);
            const validChildSkills = childSkills.filter(
              (skill) => skill.name !== "Related Skills"
            );
            const newBreadcrumbPath = [
              ...breadcrumbPath,
              {
                name: skill.name,
                path_addr: skill.path_addr,
                ratings: skill.ratings,
              },
            ];
            this.renderCategorySoftSkill(
              validChildSkills,
              newBreadcrumbPath,
              softSkillAccordian,
              skillId,
              parentskills,
              skillName,
              highlightSkill
            );
          }
        }
      });

      skillsContainer.appendChild(skillButton);
    });
    softSkillAccordian.appendChild(skillsContainer);
  }

  renderCategorySoftSkillBreadcrumb(
    skills,
    breadcrumbPath,
    softSkillAccordian,
    skillId,
    parentskills,
    skillName,
    highlightSkill
  ) {
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }

    // Create breadcrumb element
    const breadcrumb = document.createElement("div");
    breadcrumb.classList.add("breadcrumb");
    breadcrumb.style =
      "padding:10px; background-color:white; display:none; border-radius:5px;";

    if (breadcrumbPath.length > 0) {
      breadcrumb.style.display = "";

      const knowledgeLink = document.createElement("span");
      knowledgeLink.textContent = skills[0].tags[0].title;
      knowledgeLink.style.cursor = "pointer";
      knowledgeLink.style.color = "#A7A4DC";
      knowledgeLink.style.marginRight = "5px";
      knowledgeLink.addEventListener("click", async () => {
        this.renderCategorySoftSkill(
          parentskills,
          [],
          softSkillAccordian,
          skillId,
          parentskills,
          skillName,
          highlightSkill
        );

        const allButtons = document.querySelectorAll(".softskillbutton");
        allButtons.forEach((btn) =>
          btn.classList.remove("active-skill-button")
        );
      });
      breadcrumb.appendChild(knowledgeLink);

      const separator = document.createElement("img");
      separator.src = `${imagePath}Group 18.svg`;
      separator.style.marginRight = "5px";
      breadcrumb.appendChild(separator);
    }

    // Create clickable breadcrumb items
    breadcrumbPath.forEach((breadcrumbItem, index) => {
      const breadcrumbLink = document.createElement("span");
      breadcrumbLink.textContent = breadcrumbItem.name;
      breadcrumbLink.style.color =
        index === breadcrumbPath.length - 1 ? "rgb(51, 51, 51)" : "rgb(0, 102, 204)";
      breadcrumbLink.style.fontWeight = index === breadcrumbPath.length -1 ? "bold" : "normal";
      breadcrumbLink.style.fontSize = "15px";
      breadcrumbLink.style.marginRight = "5px";

      breadcrumbLink.addEventListener("click", async () => {
        const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
        const skills = await this.fetchSkillsAsync(childSkillApiEndpoint);
        const childrenSkills = skills.filter(
          (item) => item.name !== "Related Skills"
        );

        const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);
        this.renderCategorySoftSkill(
          childrenSkills,
          newBreadcrumbPath,
          softSkillAccordian,
          skillId,
          parentskills,
          skillName,
          highlightSkill
        );
      });

      breadcrumb.appendChild(breadcrumbLink);

      if (index < breadcrumbPath.length - 1) {
        const separator = document.createElement("img");
        separator.src = `${imagePath}Group 18.svg`;
        separator.style.marginRight = "5px";
        breadcrumb.appendChild(separator);
      }
    });

    // Add rating button if the current breadcrumb item has ratings
    const currentBreadcrumbItem = breadcrumbPath[breadcrumbPath.length - 1];
    if (
      currentBreadcrumbItem &&
      currentBreadcrumbItem.ratings &&
      currentBreadcrumbItem.ratings.length > 0
    ) {
      const rateButton = document.createElement("button");
      rateButton.className = "ratebutton";
      rateButton.setAttribute("id", currentBreadcrumbItem.path_addr);
      rateButton.style.marginLeft = "5px";
      rateButton.style.paddingTop = "1px";
      rateButton.style.paddingBottom = "1px";
      rateButton.style.border = "none";
      rateButton.style.borderRadius = "5px";
      rateButton.style.backgroundColor = "#E0DEFF";
      rateButton.style.cursor = "pointer";

      const rateButtonSpan = document.createElement("span");

      const searchText = searchByName(currentBreadcrumbItem.name,currentBreadcrumbItem.path_addr);

      if (searchText.length > 0) {
        rateButton.style.backgroundColor = "#E0DEFF";
        rateButtonSpan.textContent = "Rated";
        rateButtonSpan.style.color = "#1E1E1E";
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 23.svg`;
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        rateButton.appendChild(starIcon);
      } else {
        rateButton.style.backgroundColor = "#EFF4FA";
        rateButtonSpan.textContent = "Rate";
        rateButtonSpan.style.color = "#636363";
        const starIcon = document.createElement("i");
        starIcon.className = "fas fa-star";
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.style.color = "rgb(204, 204, 255)";
        rateButton.appendChild(starIcon);
      }
      rateButtonSpan.style.fontSize = "16px";

      rateButton.appendChild(rateButtonSpan);

      rateButton.addEventListener("click", () => {
        this.changeRateModelElement(currentBreadcrumbItem);
      });

      breadcrumb.appendChild(rateButton);
    }

    // Append breadcrumb to accordion
    softSkillAccordian.appendChild(breadcrumb);
  }
  
  renderRelatedHardSkillBreadcrumb(
    skills,
    breadcrumbPath,
    softSkillAccordian,
    skillId
  ) {
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }

    // Create breadcrumb element
    const breadcrumb = document.createElement("div");
    breadcrumb.classList.add("breadcrumb");
    breadcrumb.style =
      "padding:10px; background-color:white; display:none; border-radius:5px;";

    if (breadcrumbPath.length > 0) {
      breadcrumb.style.display = "";

      const knowledgeLink = document.createElement("span");
      knowledgeLink.textContent = "Related Skills";
      knowledgeLink.style.cursor = "pointer";
      knowledgeLink.style.color = "#A7A4DC";
      knowledgeLink.style.marginRight = "5px";
      knowledgeLink.addEventListener("click", async () => {
        const parentSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
        try {
          const parentSkills = await this.fetchSkillsAsync(parentSkillApiEndpoint);

          this.renderRelatedHardSkills(
            parentSkills,
            [],
            softSkillAccordian,
            skillId
          );
        } catch (error) {
          console.error(error);
        }
      });
      breadcrumb.appendChild(knowledgeLink);

      const separator = document.createElement("img");
      separator.src = `${imagePath}Group 18.svg`;
      separator.style.marginRight = "5px";
      breadcrumb.appendChild(separator);

      const clickedSkill = breadcrumbPath[breadcrumbPath.length - 1];
      const clickedSkillName = clickedSkill.name;
      const clickedSkillPath = clickedSkill.path_addr;

      const clickedSkillLink = document.createElement("span");
      clickedSkillLink.textContent = clickedSkillName;
      clickedSkillLink.style.color = "#4F46FB";
      clickedSkillLink.style.marginRight = "5px";
      breadcrumb.appendChild(clickedSkillLink);

      // Check if the clicked skill has ratings
      if (clickedSkill.ratings && clickedSkill.ratings.length > 0) {
        const rateButton = document.createElement("button");
        rateButton.className = "ratebutton";
        rateButton.setAttribute("id", clickedSkillPath);
        rateButton.style.marginLeft = "5px";
        rateButton.style.paddingTop = "1px";
        rateButton.style.paddingBottom = "1px";
        rateButton.style.border = "none";
        rateButton.style.borderRadius = "5px";
        rateButton.style.cursor = "pointer";

        const rateButtonSpan = document.createElement("span");

        const searchText = searchByName(clickedSkill.name,clickedSkill.path_addr);
        if (searchText.length > 0) {
          rateButton.style.backgroundColor = "#E0DEFF";
          rateButtonSpan.textContent = "Rated";
          rateButtonSpan.style.color = "#1E1E1E";
          const starIcon = document.createElement("img");
          starIcon.src = `${imagePath}Group 23.svg`;
          starIcon.style.marginRight = "5px";
          starIcon.style.cursor = "pointer";
          rateButton.appendChild(starIcon);
        } else {
          rateButton.style.backgroundColor = "#EFF4FA";
          rateButtonSpan.textContent = "Rate";
          rateButtonSpan.style.color = "#636363";
          const starIcon = document.createElement("i");
          starIcon.className = "fas fa-star";
          starIcon.style.marginRight = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.style.color = "rgb(204, 204, 255)";
          rateButton.appendChild(starIcon);
        }
        rateButtonSpan.style.fontSize = "16px";

        rateButton.appendChild(rateButtonSpan);
        rateButton.addEventListener("click", () => {
          this.changeRateModelElement(clickedSkill);
        });

        breadcrumb.appendChild(rateButton);
      }
    }

    // Append breadcrumb to accordion
    softSkillAccordian.appendChild(breadcrumb);
  }

  renderRelatedHardSkills(skills, breadcrumbPath, softSkillAccordian, skillId) {

    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }
    softSkillAccordian.innerHTML = "";

    this.renderRelatedHardSkillBreadcrumb(
      skills,
      breadcrumbPath,
      softSkillAccordian,
      skillId
    );

    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("softskillparentaccordian");
    skillsContainer.setAttribute("id", "softskillparentaccordian");
    skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
    skillsContainer.style.textAlign = "left";

    skills.forEach((skill) => {
      const skillButton = document.createElement("button");
      skillButton.className = "softskillbutton";
      skillButton.setAttribute("id", skill.path_addr + "button");
      skillButton.style.border = "1px solid #4f4f4f";
      skillButton.style.borderRadius = "20px";
      skillButton.style.margin = "5px";
      skillButton.style.padding = "6px 12px";
      skillButton.style.backgroundColor = "#FFFFFF";
      skillButton.style.cursor = "pointer";
      skillButton.style.color = "#4f4f4f";
      skillButton.style.fontWeight = "500";
      skillButton.style.fontSize = "14px";
      skillButton.setAttribute("data-mdb-tooltip-init", "");

      const childCount = skill.child_count || 0;
      const ratingsCount = skill.ratings ? skill.ratings.length : 0;
      const description = skill.description;
      const buttonContentDiv = document.createElement("div");
      buttonContentDiv.setAttribute("id", skill.path_addr + "div");
      buttonContentDiv.style =
        "display:flex; align-items:center; justify-content:center;";

      const skillNameSpan = document.createElement("span");
      skillNameSpan.textContent = skill.name;
      if (skill.proxy_skill) {
        manageTooltip(skillNameSpan, skill.proxy_skill.name);
      } else if (skill.name.length > 40) {
        skillNameSpan.classList.add("truncate");
        manageTooltip(skillNameSpan, skill.name);
      }

      if (description) {
        const descriptionImg = document.createElement("img");
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        descriptionImg.style.marginRight = "10px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);

      if (childCount > 1) {
        const hoverCircleImg = document.createElement("img");
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        var tooltip = `${childCount} sub categories`;
        hoverCircleImg.style.marginLeft = "5px";
        buttonContentDiv.appendChild(hoverCircleImg);
        manageTooltip(hoverCircleImg, tooltip);
      }

      if (ratingsCount > 0) {
        const searchText = searchByName(skill.name,skill.path_addr);
        if (searchText.length > 0) {
          const starIcon = document.createElement("img");
          starIcon.src = `${imagePath}Group 23.svg`;
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            this.changeRateModelElement(skill);
          });
          buttonContentDiv.appendChild(starIcon);
          skillButton.style.backgroundColor = "#E0DEFF";
        } else {
          const starIcon = document.createElement("i");
          starIcon.className = "fas fa-star";
          starIcon.setAttribute("id", skill.path_addr);
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.style.color = "#ccccff";
          starIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            this.changeRateModelElement(skill);
          });
          buttonContentDiv.appendChild(starIcon);
        }
      }
      skillButton.appendChild(buttonContentDiv);
      // Add click event to fetch and display child skills or call changeRateModelElement
      skillButton.addEventListener("click", async () => {
        if (skill.child_count === 1 || skill.child_count === 0) {
          this.changeRateModelElement(skill);
        } else {
          const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
          const childSkills = await this.fetchSkillsAsync(childSkillApiEndpoint);
          const validParentSkills = childSkills.filter(
            (skill) => skill.name !== "Related Skills"
          );

          const newBreadcrumbPath = [
            ...breadcrumbPath,
            {
              name: skill.name,
              path_addr: skill.path_addr,
              ratings: skill.ratings,
            },
          ];
          this.renderRelatedHardSkills(
            validParentSkills,
            newBreadcrumbPath,
            softSkillAccordian,
            skillId
          );
        }
      });

      skillsContainer.appendChild(skillButton);
    });
    softSkillAccordian.appendChild(skillsContainer);
  }

   renderHardSkillBreadcrumb(
    skills,
    breadcrumbPath,
    softSkillAccordian,
    skillId,
    parentskills,
    skillName,
    highlightSkill
  ) {
    const hardSkillId = skillId;
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }

    const breadcrumbWrapper = document.createElement("div");
    breadcrumbWrapper.className = "category-label-container";

    // Create breadcrumb element
    const breadcrumb = document.createElement("div");
    breadcrumb.className = "breadcrumb";

      const backBtn = document.createElement("button");
      backBtn.style.display = "flex";
      backBtn.style.alignItems = "center";
      backBtn.style.gap = "1rem";

      // Create icon
      const icon = document.createElement("i");
      icon.className = "fa-solid fa-angle-left";
      icon.style.fontSize = "10px"

      // Create text
      const text = document.createElement("span");
      text.innerText = " Back";

      // Style button
      backBtn.className = "back-btn";

      backBtn.addEventListener("click", () => {
        softSkillAccordian.style.display = "none";
        this.categoryLabelsContainer.innerHTML = "";
        this.categoryLabelsContainer.appendChild(this.categoryHeadingLabel);
        this.categoryLabelsContainer.appendChild(this.categorySearchLabel);
        this.fetchSkills("");
        openHomeTab()

        const tabsDiv = document.querySelector(".tabs");
        const allTabs = tabsDiv.querySelectorAll("button");
      
        allTabs.forEach(btn => btn.classList.remove("active"));

        allTabs.forEach(btn => {
            if (btn.textContent.trim() === "Browse Function/Industries") {
                btn.classList.add("active");
            }
        });

      });

      // Append icon + text
      backBtn.appendChild(icon);
      backBtn.appendChild(text);

      breadcrumb.appendChild(backBtn);

      if(this.updatedBreadcrumbItem.length  > 0){
        this.updatedBreadcrumbItem.forEach((breadcrumbItem, index) => {
          const parentBreadcrumbLink = document.createElement("span");
          parentBreadcrumbLink.textContent = breadcrumbItem.name;
          parentBreadcrumbLink.className = "breadcrumb-path-labels";
          parentBreadcrumbLink.style.color = "#6D6D6D";
    
    
          parentBreadcrumbLink.addEventListener("click", async () => {
            const parentSkillsFetchedByPath = this.fetchSkillsByPath(breadcrumbItem.path_addr);
            this.updatedBreadcrumbItem = this.updatedBreadcrumbItem.slice(0, index + 1);
    
            softSkillAccordian.style.display = "none";
    
            this.renderHardSkills(
              parentSkillsFetchedByPath,
              [],
              softSkillAccordian,
              skillId,
              parentskills,
              skillName,
              highlightSkill,
            );
    
            const allButtons = document.querySelectorAll(".softskillbutton");
            allButtons.forEach((btn) =>
              btn.classList.remove("active-skill-button")
            );
    

            this.updateBreadcrumbs([], breadcrumbItem);
            this.updatedRenderBreadcrumb();
          });
    
          breadcrumb.appendChild(parentBreadcrumbLink);
    
          const sep = document.createElement("img");
          sep.src = `${imagePath}Group 18.svg`;
          sep.style.marginRight = "5px";
          sep.style.width = "7px"
          breadcrumb.appendChild(sep);
        })
      }

      const breadcrumbLink = document.createElement("span");
      breadcrumbLink.textContent = skillName;
      breadcrumbLink.className = "breadcrumb-path-labels";
      breadcrumbLink.style.color = breadcrumbPath.length === 0 ? "#3F5AF7" : "#6D6D6D";

      breadcrumbLink.addEventListener("click", async () => {
        const parentSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${hardSkillId}`; 
        const parentSkills = await this.fetchSkillsAsync(parentSkillApiEndpoint);
        const filterSkills = parentSkills.filter(
          (item) => item.name !== "Related Skills"
        );
  
        this.renderHardSkills(
          parentskills,
          [],
          softSkillAccordian,
          skillId,
          parentskills,
          skillName,
          highlightSkill,
        );
        const allButtons = document.querySelectorAll(".softskillbutton");
        allButtons.forEach((btn) =>
          btn.classList.remove("active-skill-button")
        );
      });
      breadcrumb.appendChild(breadcrumbLink);

      if(breadcrumbPath.length > 0){
        const separator = document.createElement("img");
        separator.src = `${imagePath}Group 18.svg`;
        separator.style.marginRight = "5px";
        separator.style.width = "7px"
        breadcrumb.appendChild(separator);
      }

    // Create clickable breadcrumb items
    breadcrumbPath.forEach((breadcrumbItem, index) => {
      const breadcrumbLink = document.createElement("span");
      breadcrumbLink.className = "breadcrumb-path-labels";
      breadcrumbLink.textContent = breadcrumbItem.name;
      breadcrumbLink.style.color = index === breadcrumbPath.length - 1 ? "#3F5AF7" : "#6D6D6D";

      breadcrumbLink.addEventListener("click", async () => {
        if (breadcrumbItem.name == "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
          const relatedSkills = await this.fetchSkillsAsync(relatedSkillApiEndpoint);
          relatedSkills.forEach((skill) => {
            if (skill.child_count === 1 && skill.ratings.length > 0) {
              skill.child_count = 0;
            }
          });
          const validRelatedSkills = relatedSkills.filter(
            (relatedSkill) => relatedSkill.child_count !== 1
          );

          const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);
          this.renderHardSkills(
            validRelatedSkills,
            newBreadcrumbPath,
            softSkillAccordian,
            skillId,
            parentskills,
            skillName,
            highlightSkill
          );
        } else {
          const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
          const skills = await this.fetchSkillsAsync(childSkillApiEndpoint);
          const childrenSkills = skills.filter(
            (item) => item.name !== "Related Skills"
          );
          const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);

          this.renderHardSkills(
            childrenSkills, 
            newBreadcrumbPath,
            softSkillAccordian,
            skillId,
            parentskills,
            skillName,
            highlightSkill
          );
        }
      });

      breadcrumb.appendChild(breadcrumbLink);

      if (index < breadcrumbPath.length - 1) {
        const separator = document.createElement("img");
        separator.src = `${imagePath}Group 18.svg`;
        separator.style.marginRight = "5px";
        separator.style.width = "7px"
        breadcrumb.appendChild(separator);
      }
    });

    // Append breadcrumb to accordion
    breadcrumbWrapper.appendChild(breadcrumb)
    softSkillAccordian.appendChild(breadcrumbWrapper);

    // Breadcrumb container
    var breadcrumbContainer = document.createElement("div");
    breadcrumbContainer.style.display = "flex";
    breadcrumbContainer.style.alignItems = "center";
    breadcrumbContainer.style.flexWrap = "wrap";
    breadcrumbContainer.style.gap = "5px";

    const parentSkillNameObj = {
      name: skillName
    }

    const currentItemSkill = breadcrumbPath.at(-1) ?? parentSkillNameObj;

    const currentItem = this.createBreadcrumbItem(currentItemSkill, true);
    currentItem.style.width = "100%";
    breadcrumbContainer.appendChild(currentItem);

    softSkillAccordian.appendChild(breadcrumbContainer);
  }

  renderHardSkills(
    skills,
    breadcrumbPath,
    softSkillAccordian,
    skillId,
    parentskills = [],
    skillName,
    highlightSkill,
    clickedSkillParentName,
    clickedSkillParenId
  ) {
    const CHUNK_SIZE = 20; // Number of skills to load at once
    let loadedCount = 0;

    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }
    softSkillAccordian.innerHTML = "";

    const breadcrumbSkillName = clickedSkillParentName && clickedSkillParentName.trim() !== "" ?
        clickedSkillParentName :
        skillName;

    const breadcrumbSkillId = clickedSkillParenId && clickedSkillParenId.trim() !== "" ?
        clickedSkillParenId :
        skillId;

    // Render breadcrumb
    this.renderHardSkillBreadcrumb(
      skills,
      breadcrumbPath,
      softSkillAccordian,
      skillId,
      parentskills,
      skillName,
      highlightSkill
    );

    skills.sort(
      (a, b) =>
        (a.display_order !== null ? a.display_order : Infinity) -
        (b.display_order !== null ? b.display_order : Infinity)
    );

    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("softskillparentaccordian");
    skillsContainer.style.border = "1px solid #F6F6F6";
    skillsContainer.style.paddingBottom = "1rem";
    skillsContainer.style.borderBottomLeftRadius = "1rem";
    skillsContainer.style.borderBottomRightRadius = "1rem";
    skillsContainer.setAttribute("id", "softskillparentaccordian");
    skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");

    // --- Helper to render a chunk of skills ---
    const renderChunk = (startIdx, endIdx) => {
      for (let i = startIdx; i < endIdx && i < skills.length; i++) {
        const skill = skills[i];
        const skillButton = document.createElement("div");
        skillButton.className = "softskillbutton";
        skillButton.setAttribute("id", skill.path_addr + "button");
        skillButton.setAttribute("data-mdb-tooltip-init", "");
        const ratingboxContainer = document.createElement("div");

    
        const childCount = skill.child_count || 0;
        const ratingsCount = skill.ratings ? skill.ratings.length : 0;
        const description = skill.description;
    
        // Build flex layout for button content
        const buttonContentDiv = document.createElement("div");
        buttonContentDiv.className = "button-content-div";
        buttonContentDiv.style.display = "flex";
        buttonContentDiv.style.alignItems = "flex-start";
        buttonContentDiv.style.borderBottom = "1px solid #F6F6F6";
        buttonContentDiv.style.width = "100%";
        buttonContentDiv.style.justifyContent = "space-between";
        buttonContentDiv.setAttribute("id", skill.path_addr + "div");
    
        // Left section: [HoverCircle] [SkillName] [Description]
        const leftDiv = document.createElement("div");
        leftDiv.className = "left-div skill-pill";
        leftDiv.setAttribute("data-path-addr", skill.path_addr);
        leftDiv.style.alignItems = "center";
        leftDiv.style.padding = "0.625rem 0.75rem";
        leftDiv.style.backgroundColor = "rgb(255, 255, 255)";
        leftDiv.style.color = "rgb(79, 79, 79)";
        leftDiv.style.fontSize = "0.875rem";
        leftDiv.style.fontWeight = "500";
        leftDiv.style.cursor = "pointer";
        leftDiv.style.transition = "background-color 0.2s";
        leftDiv.style.paddingLeft = "2rem";
      
        const skillNameSpan = document.createElement("span");
        skillNameSpan.id = "skill-name";
        skillNameSpan.style.display = "inline-flex";
        skillNameSpan.style.alignItems = "center";
        skillNameSpan.style.gap = "0.6rem"; 
        skillNameSpan.innerHTML = "";
        const arrowIcon = document.createElement("i");
        arrowIcon.className = "fa-solid fa-chevron-right";
        arrowIcon.style.fontSize = "0.438rem";
        const folderIcon = document.createElement("i");

        if (skill.child_count > 0) {
            folderIcon.className = "fa-solid fa-folder";
            folderIcon.innerHTML = ""; 
            skillNameSpan.appendChild(arrowIcon); 
          } else {
            folderIcon.className = ""; 
            folderIcon.innerHTML = `<img src="${imagePath}file.png" alt="file image" />`;
          }
        folderIcon.style.color = "#f4c542";
        folderIcon.style.fontSize = "12px";
        const text = document.createTextNode(skill.name);
        skillNameSpan.appendChild(folderIcon);
        skillNameSpan.appendChild(text);
       
        leftDiv.appendChild(skillNameSpan);  
        buttonContentDiv.appendChild(leftDiv);
        
        const rightIconDiv = document.createElement("div");
        rightIconDiv.style.display = "flex";
        rightIconDiv.style.alignItems = "center";
        rightIconDiv.className = "rating-details-container";
    
        // --- Rating details logic ---
        let ratingLabel = "";
        let percentage = 0;
        let showCalendarIcon = false;
        const storageKey = isLoginUser ? "logginUserRatedSkills" : "userRatedSkills";
        const storedSkills = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const matchedSkill = storedSkills.find(s => s.isot_file_id === skill.path_addr);

        if (matchedSkill?.isot_file?.ratings?.length) {
            let ratingIndex = matchedSkill.rating.length === 2 ? 1 : 0;
            const ratingValue = matchedSkill.rating[ratingIndex]?.rating;
            const ratingScale = matchedSkill.isot_file?.ratings?.[ratingIndex]?.rating_scale_label || [];
            const isCertification = matchedSkill.isot_file.tags?.some(tag => tag.title === "Certifications");

            if (isCertification && matchedSkill.isot_file.ratings[ratingIndex].rating_scale_type === "Two Choice Rating") {
                percentage = (ratingValue === 1) ? 100 : 0;
                ratingLabel = ratingValue === 1 ? ratingScale[0] : "";
            } else {
                const ratingScaleLength = ratingScale.length;
                if (ratingScaleLength > 0) {
                    percentage = ((ratingValue - 1) / ratingScaleLength) * 100;
                }
                if (ratingValue > 0) {
                    ratingLabel = ratingScale[ratingValue - 2] || "";
                }
                showCalendarIcon = matchedSkill.isot_file?.ratings?.[ratingIndex]?.rating_category === "Experience Level";
            }
        }

        // ======= Create doughnut image =======
        const ratingDetails = document.createElement("div");
        ratingDetails.className = "px-2 rating-details";
        if (percentage === 25) {
            const image25 = document.createElement("img");
            image25.src = imagePath + "firstRing.png";
            image25.style.width = "25px";
            image25.style.height = "25px";
            ratingDetails.appendChild(image25);
        }
        if (percentage === 50) {
            const image50 = document.createElement("img");
            image50.src = imagePath + "secondRing.png";
            image50.style.width = "25px";
            image50.style.height = "25px";
            ratingDetails.appendChild(image50);
        }
        if (percentage === 75) {
            const image75 = document.createElement("img");
            image75.src = imagePath + "thirdRing.png";
            image75.style.width = "25px";
            image75.style.height = "25px";
            ratingDetails.appendChild(image75);
        }
        if (percentage === 100) {
            const image100 = document.createElement("img");
            image100.src = imagePath + "forthRing.png";
            image100.style.width = "25px";
            image100.style.height = "25px";
            ratingDetails.appendChild(image100);
        }

        // ======= Create label =======
        const experienceDetails = document.createElement("div");
        experienceDetails.className = "pr-3 experience-details";
        experienceDetails.style.color = "#9B9B9B";
        experienceDetails.style.fontSize = "14px";
        experienceDetails.innerHTML = showCalendarIcon
            ? `<i class="fa fa-lg fa-calendar-days me-1 text-primary"></i> ${ratingLabel}`
            : `${ratingLabel}`;

        // Only add if label is present
        if (ratingLabel) {
            rightIconDiv.appendChild(ratingDetails);
        }

        if (ratingsCount > 0) {
          const searchText = searchByName(skill.name, skill.path_addr);
          const starIcon = document.createElement("img");
          if (searchText.length > 0) {
            starIcon.style.display = "none";
          } else {
            starIcon.src = `${imagePath}circleplus.png`;
            starIcon.style.width = "20px";
            starIcon.style.height = "20px";
          }
          starIcon.style.marginLeft = "10px";
          starIcon.style.cursor = "pointer";

          starIcon.addEventListener("mouseenter", () => {
            starIcon.src = `${imagePath}hovercircleplus.png`;
          });

          starIcon.addEventListener("mouseleave", () => {
            starIcon.src = `${imagePath}circleplus.png`;
          });

          starIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            starIcon.style.display = "none";

            document.querySelectorAll(".rating-box").forEach((box) => {
              box.style.display = "none";
            });
            let ratingBox = this.createRatingBoxSearchPage(skill, "", starIcon, buttonContentDiv, skillNameSpan);
            ratingboxContainer.innerHTML = "";
            ratingboxContainer.appendChild(ratingBox);

            // Toggle visibility
            ratingBox.style.display = "block";
          });
          rightIconDiv.appendChild(starIcon);
          skillNameSpan.appendChild(rightIconDiv);
        }

        skillButton.appendChild(buttonContentDiv);
        leftDiv.appendChild(ratingboxContainer);
    
        // Warning popup, unchanged
        const warningPopup = document.createElement("div");
        warningPopup.className = "skill-popup-warning";
        warningPopup.textContent = "Please Select the parent skill first.";
        warningPopup.style.position = "absolute";
        warningPopup.style.backgroundColor = "#fff3cd";
        warningPopup.style.border = "1px solid #ffeeba";
        warningPopup.style.padding = "6px 10px";
        warningPopup.style.borderRadius = "8px";
        warningPopup.style.fontSize = "13px";
        warningPopup.style.color = "#856404";
        warningPopup.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
        warningPopup.style.zIndex = "9999";
        warningPopup.style.whiteSpace = "nowrap";
        warningPopup.style.display = "none";
        warningPopup.style.transform = "translate(-50%, -110%)";
        warningPopup.style.left = "50%";
        warningPopup.style.top = "0";
        warningPopup.style.pointerEvents = "none";
        skillButton.style.position = "relative";
        skillButton.appendChild(warningPopup);
    
        // Click event logic (unchanged)
        leftDiv.addEventListener("click", async () => {
          if (skill.child_count === 0 && skill.ratings.length > 0) {
            console.log("zeroskill-data", skill);
          } else if (skill.name === "Related Skills") {
            const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
            const relatedSkills = await this.fetchSkillsAsync(relatedSkillApiEndpoint);
            relatedSkills.forEach((skill) => {
              if (skill.child_count === 1 && skill.ratings.length > 0) {
                skill.child_count = 0;
              }
            });
            if (relatedSkills.length > 0) {
              const validRelatedSkills = relatedSkills.filter(
                (relatedSkill) => relatedSkill.child_count !== 1
              );
              const newBreadcrumbPath = [
                ...breadcrumbPath,
                {
                  name: skill.name,
                  path_addr: skill.path_addr,
                  ratings: skill.ratings,
                },
              ];
              this.renderHardSkills(
                validRelatedSkills,
                newBreadcrumbPath,
                softSkillAccordian,
                skillId,
                parentskills,
                skillName,
                highlightSkill,
                breadcrumbSkillName,
                breadcrumbSkillId
              );
            }
          } else {
            if (skill.child_count > 0 && skill.name !== "Related Skills") {
              const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
              const childSkills = await this.fetchSkillsAsync(childSkillApiEndpoint);
              const validChildSkills = childSkills.filter(
                (skill) => skill.name !== "Related Skills"
              );
              const newBreadcrumbPath = [
                ...breadcrumbPath,
                {
                  name: skill.name,
                  path_addr: skill.path_addr,
                  ratings: skill.ratings,
                },
              ];
              this.renderHardSkills(
                validChildSkills,
                newBreadcrumbPath,
                softSkillAccordian,
                skillId,
                parentskills,
                skillName,
                highlightSkill,
                breadcrumbSkillName,
                breadcrumbSkillId
              );
            }
          }
        });
        skillsContainer.appendChild(skillButton);
      }
    };

    // --- Initial load of first chunk ---
    renderChunk(0, CHUNK_SIZE);
    loadedCount = CHUNK_SIZE;
    softSkillAccordian.appendChild(skillsContainer);

    // --- Infinite Scroll Event ---
    skillsContainer.addEventListener('scroll', () => {
      if (
        skillsContainer.scrollTop + skillsContainer.clientHeight >=
          skillsContainer.scrollHeight - 100 && loadedCount < skills.length
      ) {
        const endIdx = Math.min(loadedCount + CHUNK_SIZE, skills.length);
        renderChunk(loadedCount, endIdx);
        loadedCount = endIdx;
      }
    });

    // Optionally, always reset scroll to top on rerender
    skillsContainer.scrollTop = 0;
  }

  renderCategoryHardSkills(
    skills,
    breadcrumbPath,
    softSkillAccordian,
    skillId,
    parentskills = [],
    skillName,
    highlightSkill,
    clickedSkillParentName,
    clickedSkillParenId
  ) {
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }
    // Clear existing content in softSkillAccordian before appending new content
    softSkillAccordian.innerHTML = "";

    const breadcrumbSkillName = clickedSkillParentName && clickedSkillParentName.trim() !== "" ?
        clickedSkillParentName :
        skillName;

    const breadcrumbSkillId = clickedSkillParenId && clickedSkillParenId.trim() !== "" ?
        clickedSkillParenId :
        skillId;

    // Render breadcrumb
    this.renderCategoryHardSkillBreadcrumb(
      skills,
      breadcrumbPath,
      softSkillAccordian,
      skillId,
      parentskills,
      skillName,
      highlightSkill
    );
    skills.sort(
      (a, b) =>
        (a.display_order !== null ? a.display_order : Infinity) -
        (b.display_order !== null ? b.display_order : Infinity)
    );
    // Create buttons for each skill
    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("softskillparentaccordian");
    skillsContainer.setAttribute("id", "softskillparentaccordian");
    skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
    skillsContainer.style.textAlign = "left";

    skills.forEach((skill) => {
      const skillButton = document.createElement("button");
      skillButton.className = "softskillbutton";
      skillButton.setAttribute("id", skill.path_addr + "button");
      skillButton.style.border = "1px solid #4f4f4f";
      skillButton.style.borderRadius = "20px";
      skillButton.style.margin = "5px";
      skillButton.style.padding = "6px 12px";
      skillButton.style.background = "#FFFFFF";
      skillButton.style.cursor = "pointer";
      skillButton.style.color = "#4f4f4f";
      skillButton.style.fontWeight = "500";
      skillButton.style.fontSize = "14px";
      skillButton.setAttribute("data-mdb-tooltip-init", "");

      const warningPopup = document.createElement("div");
      warningPopup.className = "skill-popup-warning";
      warningPopup.textContent = "Please Select the parent skill first.";
      warningPopup.style.position = "absolute";
      warningPopup.style.backgroundColor = "#fff3cd";
      warningPopup.style.border = "1px solid #ffeeba";
      warningPopup.style.padding = "6px 10px";
      warningPopup.style.borderRadius = "8px";
      warningPopup.style.fontSize = "13px";
      warningPopup.style.color = "#856404";
      warningPopup.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
      warningPopup.style.zIndex = "9999";
      warningPopup.style.whiteSpace = "nowrap";
      warningPopup.style.display = "none";
      warningPopup.style.transform = "translate(-50%, -110%)";
      warningPopup.style.left = "50%";
      warningPopup.style.top = "0";
      warningPopup.style.pointerEvents = "none";

      const hoverCircleImg = document.createElement("img");
      const descriptionImg = document.createElement("img");

      this.addHoverStyles(skillButton,hoverCircleImg);

      if (highlightSkill && skill.name === highlightSkill) {
        hoverCircleImg.classList.add("brightened");
        skillButton.classList.add("highlighted-skill");
      }
      else{
        hoverCircleImg.classList.remove("brightened");
      }

      const childCount = skill.child_count || 0;
      const ratingsCount = skill.ratings ? skill.ratings.length : 0;
      const description = skill.description;

      const buttonContentDiv = document.createElement("div");
      buttonContentDiv.setAttribute("id", skill.path_addr + "div");
      buttonContentDiv.style =
        "display:flex; align-items:center; justify-content:center;";

      const skillNameSpan = document.createElement("span");
      skillNameSpan.textContent = skill.name;
      if (skill.name.length > 40) {
        skillNameSpan.classList.add("truncate");
        if(skill.proxy_skill){
          manageTooltip(skillNameSpan, skill.proxy_skill.name);
          manageTooltip(descriptionImg,description);
        }
        else{
          manageTooltip(skillNameSpan, skill.name);
          manageTooltip(descriptionImg,description);
        }
      }else if (skill.proxy_skill){
        manageTooltip(skillNameSpan, skill.proxy_skill.name);
        manageTooltip(descriptionImg,description);
      }
      else{
        manageTooltip(skillNameSpan,description);
      }

      if (description) {
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        descriptionImg.style.marginRight = "10px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);

      if (childCount > 0 && childCount !=1) {
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        var tooltip = `${childCount} sub categories`;
        hoverCircleImg.style.marginLeft = "5px";
        buttonContentDiv.appendChild(hoverCircleImg);
        manageTooltip(hoverCircleImg, tooltip);
      }
      else if (childCount === 1) {
        // Fetch child skills if childCount is 1
        const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        this.fetchSkillsAsync(childSkillApiEndpoint).then((childSkills) => {
          if (Array.isArray(childSkills)) {
            const validChildSkills = childSkills.filter(
              (childSkill) => childSkill.name !== "Related Skills"
            );
            if (validChildSkills.length === 0) {
                skill.child_count = 0;
            } else {
              hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
              hoverCircleImg.alt = "circle";
              hoverCircleImg.style.width = "20px";
              hoverCircleImg.style.height = "20px";
              var tooltip = `${childCount} sub categories`;
              hoverCircleImg.style.marginLeft = "5px";
              buttonContentDiv.appendChild(hoverCircleImg);
              manageTooltip(hoverCircleImg, tooltip);
            }
          }
        })
      }

      if (ratingsCount > 0) {
        const searchText = searchByName(skill.name, skill.path_addr);
        if (searchText.length > 0) {
            const starIcon = document.createElement("img");
            starIcon.src = `${imagePath}Group 25.svg`;
            starIcon.style.marginLeft = "5px";
            starIcon.style.cursor = "pointer";
            starIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                this.saveTheSkillComment("", "", skill, "");
            });
            buttonContentDiv.appendChild(starIcon);
            skillButton.classList.add('rated-skill');
        } else {
          const starIcon = document.createElement("img");
          starIcon.src = `${imagePath}Group 24.svg`;
          starIcon.setAttribute("id", skill.path_addr);
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.addEventListener("click", (event) => {
              event.stopPropagation();
              this.saveTheSkillComment("", "", skill, "");
          });
          buttonContentDiv.appendChild(starIcon);
        }
      }

      skillButton.appendChild(buttonContentDiv);

      skillButton.addEventListener("click", async () => {
        if (skill.child_count === 0 && skill.ratings.length > 0) {
          console.log("zeroskill-data", skill);
          // this.changeRateModelElement(skill);
        } else if (skill.name === "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
          const relatedSkills = await this.fetchSkillsAsync(relatedSkillApiEndpoint);
          relatedSkills.forEach((skill) => {
            if (skill.child_count === 1 && skill.ratings.length > 0) {
              skill.child_count = 0;
            }
          });
          if (relatedSkills.length > 0) {
            // Filter out skills with child_count equal to 1
            const validRelatedSkills = relatedSkills.filter(
              (relatedSkill) => relatedSkill.child_count !== 1
            );
            const newBreadcrumbPath = [
              ...breadcrumbPath,
              {
                name: skill.name,
                path_addr: skill.path_addr,
                ratings: skill.ratings,
              },
            ];
            this.renderCategoryHardSkills(
              validRelatedSkills,
              newBreadcrumbPath,
              softSkillAccordian,
              skillId,
              parentskills,
              skillName,
              highlightSkill,
              breadcrumbSkillName,
              breadcrumbSkillId
            );
          }
        } else {
          if (skill.child_count > 0 && skill.name !== "Related Skills") {
            const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
            const childSkills = await this.fetchSkillsAsync(childSkillApiEndpoint);
            const validChildSkills = childSkills.filter(
              (skill) => skill.name !== "Related Skills"
            );
            const newBreadcrumbPath = [
              ...breadcrumbPath,
              {
                name: skill.name,
                path_addr: skill.path_addr,
                ratings: skill.ratings,
              },
            ];
            this.renderCategoryHardSkills(
              validChildSkills,
              newBreadcrumbPath,
              softSkillAccordian,
              skillId,
              parentskills,
              skillName,
              highlightSkill,
              breadcrumbSkillName,
              breadcrumbSkillId
            );
          }
        }
      });

      skillButton.style.position = "relative"; 
      skillButton.appendChild(warningPopup);
      skillsContainer.appendChild(skillButton);
    });
    softSkillAccordian.appendChild(skillsContainer);
  }

  renderCategoryHardSkillBreadcrumb(
    skills,
    breadcrumbPath,
    softSkillAccordian,
    skillId,
    parentskills,
    skillName,
    highlightSkill
  ) {

    const hardSkillId = skillId;
    if (!softSkillAccordian) {
      console.error("softSkillAccordian element is not defined.");
      return;
    }

    // Create breadcrumb element
    const breadcrumb = document.createElement("div");
    breadcrumb.classList.add("breadcrumb");
    breadcrumb.style =
      "padding:10px; background-color:white; display:none; border-radius:5px;";

    if (breadcrumbPath.length > 0) {
      breadcrumb.style.display = "";

      const knowledgeLink = document.createElement("span");
      knowledgeLink.textContent = skillName;
      knowledgeLink.style.cursor = "pointer";
      knowledgeLink.style.color = "rgb(0, 102, 204)";
      knowledgeLink.style.color = "15px";
      knowledgeLink.style.marginRight = "5px";
      knowledgeLink.addEventListener("click", async () => {
        const parentSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${hardSkillId}`; // Use hardSkillId consistently
        const parentSkills = await this.fetchSkillsAsync(parentSkillApiEndpoint);
        const filterSkills = parentSkills.filter(
          (item) => item.name !== "Related Skills"
        );
        this.renderCategoryHardSkills(
          parentskills,
          [],
          softSkillAccordian,
          skillId,
          parentskills,
          skillName,
          highlightSkill
        );

        const allButtons = document.querySelectorAll(".softskillbutton");
        allButtons.forEach((btn) =>
          btn.classList.remove("active-skill-button")
        );
      });
      breadcrumb.appendChild(knowledgeLink);

      const separator = document.createElement("img");
      separator.src = `${imagePath}Group 18.svg`;
      separator.style.marginRight = "5px";
      breadcrumb.appendChild(separator);
    }

    // Create clickable breadcrumb items
    breadcrumbPath.forEach((breadcrumbItem, index) => {
      const breadcrumbLink = document.createElement("span");
      breadcrumbLink.textContent = breadcrumbItem.name;
      breadcrumbLink.style.color =
        index === breadcrumbPath.length - 1 ? "rgb(51, 51, 51)" : "rgb(0, 102, 204)";
      breadcrumbLink.style.fontWeight = index === breadcrumbPath.length -1 ? "bold" : "normal";
      breadcrumbLink.style.fontSize = "15px";
      breadcrumbLink.style.marginRight = "5px";

      breadcrumbLink.addEventListener("click", async () => {
        if (breadcrumbItem.name == "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
          const relatedSkills = await this.fetchSkillsAsync(relatedSkillApiEndpoint);
          relatedSkills.forEach((skill) => {
            if (skill.child_count === 1 && skill.ratings.length > 0) {
              skill.child_count = 0;
            }
          });
          const validRelatedSkills = relatedSkills.filter(
            (relatedSkill) => relatedSkill.child_count !== 1
          );
          const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);
          this.renderCategoryHardSkills(
            validRelatedSkills,
            newBreadcrumbPath,
            softSkillAccordian,
            skillId,
            parentskills,
            skillName,
            highlightSkill
          );
        } else {
          const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
          const skills = await this.fetchSkillsAsync(childSkillApiEndpoint);
          const childrenSkills = skills.filter(
            (item) => item.name !== "Related Skills"
          );

          const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);
          this.renderCategoryHardSkills(
            childrenSkills,
            newBreadcrumbPath,
            softSkillAccordian,
            skillId,
            parentskills,
            skillName,
            highlightSkill
          );
        }
      });

      breadcrumb.appendChild(breadcrumbLink);

      if (index < breadcrumbPath.length - 1) {
        const separator = document.createElement("img");
        separator.src = `${imagePath}Group 18.svg`;
        separator.style.marginRight = "5px";
        breadcrumb.appendChild(separator);
      }
    });

    // Add rating button if the current breadcrumb item has ratings
    const currentBreadcrumbItem = breadcrumbPath[breadcrumbPath.length - 1];
    if (
      currentBreadcrumbItem &&
      currentBreadcrumbItem.ratings &&
      currentBreadcrumbItem.ratings.length > 0
    ) {
      const rateButton = document.createElement("button");
      rateButton.className = "ratebutton";
      rateButton.setAttribute("id", currentBreadcrumbItem.path_addr);
      rateButton.style.marginLeft = "5px";
      rateButton.style.paddingTop = "1px";
      rateButton.style.paddingBottom = "1px";
      rateButton.style.border = "none";
      rateButton.style.borderRadius = "5px";
      rateButton.style.backgroundColor = "#E0DEFF";
      rateButton.style.cursor = "pointer";

      const rateButtonSpan = document.createElement("span");

      const searchText = searchByName(currentBreadcrumbItem.name,currentBreadcrumbItem.path_addr);

      if (searchText.length > 0) {
        rateButton.style.backgroundColor = "#E0DEFF";
        rateButtonSpan.textContent = "Rated";
        rateButtonSpan.style.color = "#1E1E1E";
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 25.svg`;
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        rateButton.appendChild(starIcon);
      } else {
        rateButton.style.backgroundColor = "#EFF4FA";
        rateButtonSpan.textContent = "Rate";
        rateButtonSpan.style.color = "#636363";
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 24.svg`;
        starIcon.style.marginRight = "5px";
        starIcon.style.cursor = "pointer";
        rateButton.appendChild(starIcon);
      }
      rateButtonSpan.style.fontSize = "16px";

      rateButton.appendChild(rateButtonSpan);

      rateButton.addEventListener("click", (event) => {
        this.saveTheSkillComment("", "", currentBreadcrumbItem, "");
      });

      breadcrumb.appendChild(rateButton);
    }

    // Append breadcrumb to accordion
    softSkillAccordian.appendChild(breadcrumb);
  }
}

/**
 * Profile page
 */

// Helper function to get tags as a string

// Helper function to get experience level
function getExperienceLevel(rating) {
  const experienceLevels = [
    "0 - 2 years",
    "2 - 5 years",
    "5 - 10 years",
    "10+ years",
  ];
  return experienceLevels[rating - 1] || "Not specified";
}

function getRandomColor(existingColors) {
  const letters = "0123456789ABCDEF";
  let color;

  do {
    color =
      "#" +
      Array.from(
        { length: 6 },
        () => letters[Math.floor(Math.random() * 16)]
      ).join("");
  } while (existingColors.includes(color) || isColorTooLight(color));

  existingColors.push(color);
  return color;
}

function isColorTooLight(color) {
  const rgbColor = hexToRgb(color);
  const luminance =
    (0.299 * rgbColor[0] + 0.587 * rgbColor[1] + 0.114 * rgbColor[2]) / 255;
  return luminance > 0.5;
}

function hexToRgb(hex) {
  return hex.match(/[A-Fa-f0-9]{2}/g).map((v) => parseInt(v, 16));
}

function addLightOpacity(color, opacity) {
  opacity = opacity >= 0 && opacity <= 1 ? opacity : 0.5;
  const rgbColor = hexToRgb(color);
  return `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ${opacity})`;
}

const existingColors = [];
var buttons = document.getElementsByClassName("random-color-button");

for (var i = 0; i < buttons.length; i++) {
  const randomColor = getRandomColor(existingColors);
  const randomColorWithOpacity = addLightOpacity(randomColor, 0.1);

  buttons[i].style.color = `${randomColor}`;
  buttons[i].style.border = `1px solid ${randomColor}`;
  buttons[i].style.background = randomColorWithOpacity;
}

function applyRandomColor(buttons) {
  const existingColors = [];

  for (let i = 0; i < buttons.length; i++) {
    const randomColor = getRandomColor(existingColors);
    const randomColorWithOpacity = addLightOpacity(randomColor, 0.1);

    buttons[i].style.color = `${randomColor}`;
    buttons[i].style.border = `1px solid ${randomColor}`;
    buttons[i].style.background = randomColorWithOpacity;
  }
}

function getExpertiseLevel(ratingValue, ratingLabel) {
  // Assuming the rating category for expertise level is 'Expertise Level'
  const expertiseLevelRating = ratingLabel.find(
    (r) => r.rating_category === "Expertise Level"
  );
  if (expertiseLevelRating) {
    const labelIndex = ratingValue.find(
      (r) => r.isot_rating_id === expertiseLevelRating._id
    );
    return expertiseLevelRating.rating_scale_label[labelIndex.rating - 1];
  }
  return 0;
}

function openProfileTab() {
  var homeContent = document.getElementById("home0");
  var profileContent = document.getElementById("profile0");
  if (profileContent) {
    const dropdownMenu = document.getElementById("skills-horizontal-menu");
    dropdownMenu.style.display = "none";
    profileContent.classList.add("show", "active");
    homeContent.classList.remove("show","active");
  }
}

function openHomeTab() {
  var homeContent = document.getElementById("home0");
  var profileContent = document.getElementById("profile0");
  if (homeContent) {
    homeContent.classList.add("show", "active");
    profileContent.classList.remove("show","active");
  }
}


