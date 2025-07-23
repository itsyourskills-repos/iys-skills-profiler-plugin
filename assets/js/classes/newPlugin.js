var isLoginUser = JSON?.parse(localStorage?.getItem("loginUserDetail"))
  ? true
  : false;
console.log("LoginUser", isLoginUser);
const ENDPOINT_URL = "https://uat-lambdaapi.iysskillstech.com/latest/dev-api/";
const loggedInUserApiEndpoint = `https://uat-api.myskillsplus.com/get-skills/`;
const loggedInUserAddSkill = `https://uat-api.myskillsplus.com/add-skills/`;
const deleteSkillApiEndpoint = `https://uat-api.myskillsplus.com/delete-skill/`;
const getaccessYokenEndpoint =
  "https://uat-api.myskillsplus.com/api/token/refresh/";
const getAccessToken = JSON.parse(localStorage.getItem("tokenData"));
const logginUserDetail = JSON.parse(localStorage.getItem("loginUserDetail"));
const imagePath =
  "https://cdn.jsdelivr.net/gh/itsyourskills-repos/iys-skills-profiler-plugin@uatplugin/assets/img/";
// const configuratorvalue=localStorage.setItem('iys', JSON.stringify({
//   tap: "all",
//   profile_view: "all",
//   isEdit: true,
//   isDelete: true,
//   doughnt:true,
//   experience:true,
// }));

var iysplugin = JSON.parse(localStorage.getItem("iys"));
console.log(iysplugin);
if (iysplugin == null) {
  iysplugin = {};
  iysplugin.tap = "all";
  iysplugin.profile_view = "all";
  iysplugin.isEdit = true;
  iysplugin.isDelete = true;
  iysplugin.doughnt = true;
  iysplugin.experience = true;
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
  console.log(array, isotFileId, "array, isotFileId");
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

  console.log(userRatedSkills);
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

// function checkElementExist(skillDetail) {
//   console.log(skillDetail, "skillDetail");
//   if (localStorage.getItem("logginUserRatedSkills")) {
//     let userRatedSkills = JSON.parse(
//       localStorage.getItem("logginUserRatedSkills", "[]")
//     );

//     const lastTwoId = skillDetail.path_addr.split(".").slice(-2).join(".");

//     console.log("lastTwoId", lastTwoId);
//     console.log("userRatedSkills", userRatedSkills);

//     // checking it atlest have parent id
//     if (lastTwoId.split(".").length >= 2 && userRatedSkills) {
//       let foundObject = userRatedSkills.find((skill) =>
//         skill.isot_path_addr.endsWith(lastTwoId)
//       );
//       if (foundObject) {
//         return foundObject;
//       }
//     }
//     let foundObject = userRatedSkills?.find((skill) =>
//       skill.isot_path_addr.endsWith(skillDetail.path_addr)
//     );
//     if (foundObject) {
//       return foundObject;
//     } else {
//       return null;
//     }
//   } else {
//     let userRatedSkills = JSON.parse(
//       localStorage.getItem("userRatedSkills", "[]")
//     );
//     const lastTwoId = skillDetail.path_addr.split(".").slice(-2).join(".");
//     // checking it atlest have parent id
//     if (lastTwoId.split(".").length >= 2 && userRatedSkills) {
//       let foundObject = userRatedSkills.find((skill) =>
//         skill.isot_file_id.endsWith(lastTwoId)
//       );
//       if (foundObject) {
//         return foundObject;
//       }
//     }
//     let foundObject = userRatedSkills?.find((skill) =>
//       skill.isot_file_id.endsWith(skillDetail.path_addr)
//     );
//     if (foundObject) {
//       return foundObject;
//     } else {
//       return null;
//     }
//   }
// }

function checkElementExist(skillDetail) {
  console.log(skillDetail, "skillDetail");
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
    // if (parentID) {
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
      // rating: item?.rating || (item?.ratings[0] && item?.ratings[0].rating),
      rating: item?.rating?.[0]?.rating ?? item?.ratings?.[0]?.rating ?? 0,
      isot_file_id: item?.isot_file_id || item?.isot_path_addr,
      isot_file: item?.isot_file || item?.isot_skill,
      parentSkillDetailId: item?.parentSkillDetailId
        ? item?.parentSkillDetailId
        : item?.ancestors && item?.ancestors[0]?.path_addr,
    };
    output[parentID].RatedSkills.push(ratedSkill);
    // }
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
      // // Inner loop for iterating over RatedSkills array
      // for (
      //   let obj = 0;
      //   obj < 3 && userSkillDetail[item].RatedSkills.length > obj;
      //   obj++
      // ) {
      //   // Access the isot_file object
      //   const isotFile = userSkillDetail[item].RatedSkills[obj].isot_file;
      //   const skillid = userSkillDetail[item]?.RatedSkills[obj]?.id;

      //   // Check if isot_file exists and has a name property
      //   if (isotFile && isotFile.name) {
      //     // Create a div element to display the name
      //     const nameDiv = document.createElement("div");
      //     nameDiv.setAttribute(
      //       "id",
      //       `selectedRating-${userSkillDetail[item].parentID}`
      //     );
      //     const nameDivCrossButton = document.createElement("i");
      //     nameDivCrossButton.id = `cross-btn-child-${
      //       skillid ? skillid : isotFile.path_addr
      //     }`;
      //     nameDivCrossButton.setAttribute("class", "fa fa-close");
      //     nameDivCrossButton.style.color = "red";
      //     nameDivCrossButton.style.marginLeft = "5px";
      //     nameDivCrossButton.style.cursor = "pointer";
      //     nameDivCrossButton.style.padding = "5px";
      //     nameDivCrossButton.style.zIndex = "10";
      //     console.log(
      //       userSkillDetail[item].RatedSkills,
      //       "userSkillDetail[item].RatedSkills"
      //     );
      //     nameDivCrossButton.addEventListener("click", () => {
      //       delete_skill(skillid ? skillid : isotFile.path_addr);
      //       if (userSkillDetail[item].RatedSkills.length === 1) {
      //         document.getElementById(
      //           `selectedRating-${userSkillDetail[item].parentID}`
      //         ).style.display = "none";
      //       }
      //     });
      //     nameDiv.textContent = isotFile.name;
      //     nameDiv.style.background = "white";
      //     nameDiv.style.display = "flex";
      //     nameDiv.style.zIndex = "9";
      //     nameDiv.style.border = "0.5px solid rgba(0, 125, 252, 0.2)";
      //     nameDiv.style.padding = "0px 14px";
      //     nameDiv.style.borderRadius = "30px";
      //     nameDiv.style.marginRight = "10px";
      //     nameDiv.style.width = "fit-content";
      //     // Append the div to the childDivId
      //     nameDiv.appendChild(nameDivCrossButton);
      //     childDivId.appendChild(nameDiv);
      //   }
      // }
      // if (userSkillDetail[item].RatedSkills.length > 3) {
      manageModalOnPlusOne(childDivId, userSkillDetail[item]);
      // }
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

// function to caluclate all the ratings
function sumRatings(data) {
  let totalRating = 0;

  data.forEach((item) => {
    if (
      // item.parentID &&
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
  console.log("entered");
  const htmlElementCount = sortRatingByLocalStorage();
  console.log(htmlElementCount);
  const sumofAllRatings = sumRatings(htmlElementCount);
  var elementCountLabel = document.querySelector(".elementCountLabel");
  // elementCountLabel.style.width = "fit-content";
  // elementCountLabel.style.padding = "10px 30px";
  elementCountLabel.style.margin = "20px auto";
  // elementCountLabel.style.marginTop = "20px";
  // elementCountLabel.style.marginBottom = "20px";
  elementCountLabel.style.padding = "10px 0px 10px 10px";
  // elementCountLabel.style.paddingBottom = "7px";
  // elementCountLabel.style.paddingRight = "10px";
  // elementCountLabel.style.paddingLeft = "8px";
  elementCountLabel.style.borderRadius = "30px";
  elementCountLabel.style.textAlign = "left";

  // elementCountLabel.style.zIndex = 99;
  if (htmlElementCount && sumofAllRatings) {
    elementCountLabel.style.border = "0.4px solid #E1F7E9";
    elementCountLabel.style.background = "#E1F7E9";
    elementCountLabel.innerHTML = `
      <div class="element-count-content-div" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div style="display: flex; align-items: center;">
          <div style="display: flex; justify-content: center; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
              <g transform="translate(538.943 -14.946)">
                <path d="M-528.942,14.946a10.021,10.021,0,0,1,10,10,10.011,10.011,0,0,1-10.013 10,10.01,10.01,0,0,1-9.987-10.008A10.008,10.008,0,0,1-528.942 14.946Zm-.01,1.665a8.33,8.33,0,0,0-8.325 8.353,8.33,8.33,0,0,0,8.342 8.317,8.336,8.336,0,0,0,8.327-8.336A8.327,8.327,0,0,0-528.952 16.611Z" fill="#28a745"/>
                <path d="M-407.345 191.429a1.835,1.835,0,0,1,.151-.2q2.5-2.508 5.011-5.013a.83.83,0,0,1,1.317.06.825.825,0,0,1-.049 1.012c-.047.054-.1.1-.149.154l-5.606 5.606a.855.855,0,0,1-1.4 0q-1.167-1.167-2.333-2.334a.827.827,0,0,1-.108-1.143.822.822,0,0,1,1.253-.056c.351.34.692.689 1.037 1.034C-407.939 190.83-407.66 191.111-407.345 191.429Z" transform="translate(-123.242 -164.293)" fill="#28a745"/>
              </g>
            </svg>
          </div>
          <div style="margin-left: 10px;">
            <span style="font-size:16px; color:#28a745;">${sumofAllRatings}</span> 
            <span style="font-size:16px; color:#28a745;"> element added to your profile</span>
          </div>
        </div>
        <a class="element-div-profile-link" id='profile-link' href="#" onclick="openProfileTab()" style="margin-right:20px; font-size:16px; color:#46419C; text-decoration: underline;">Rate your Skills</a>
      </div>`;
  } else {
    elementCountLabel.style.border = "0.4px solid #FEF4E4";
    elementCountLabel.style.background = "#FEF4E4";
    elementCountLabel.innerHTML = ` <div style="display: flex; align-items: center;">
      <div style="display: flex; justify-content: center; align-items: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
            <g id="Group_9" data-name="Group 9" transform="translate(509.838 -46.052)">
                <path id="Path_16" data-name="Path 16" d="M-484.838,58.546a12.49,12.49,0,0,1-12.487,12.506,12.491,12.491,0,0,1-12.513-12.509,12.489,12.489,0,0,1,12.5-12.491A12.487,12.487,0,0,1-484.838,58.546Zm-2.449.006A10.072,10.072,0,0,0-497.323,48.5a10.073,10.073,0,0,0-10.067,10.051A10.075,10.075,0,0,0-497.353,68.6,10.074,10.074,0,0,0-487.287,58.552Z" fill="#D59C66"/>
                <path id="Path_17" data-name="Path 17" d="M-335.4,242.973c.161.036.287.056.407.094a1.226,1.226,0,0,1,.826,1.386,1.173,1.173,0,0,1-1.106.994c-.479.019-.959.021-1.438,0a1.175,1.175,0,0,1-1.135-1.187c-.007-1.145,0-2.29,0-3.435v-.338c-.17-.041-.306-.062-.433-.105a1.224,1.224,0,0,1-.8-1.4,1.209,1.209,0,0,1,1.159-.978c.43-.007.861-.005,1.292,0a1.2,1.2,0,0,1,1.226,1.225c.005,1.125,0,2.251,0,3.376Z" transform="translate(-160.709 -180.673)" fill="#D59C66"/>
                <path id="Path_18" data-name="Path 18" d="M-315.378,154.031a1.231,1.231,0,0,1-1.234,1.227,1.236,1.236,0,0,1-1.219-1.246,1.2,1.2,0,0,1,1.239-1.21A1.192,1.192,0,0,1-315.378,154.031Z" transform="translate(-180.73 -100.479)" fill="#D59C66"/>
            </g>
        </svg>
      </div>
      <div style="margin-left: 10px;"><span style="font-size:16px; color:#D59C66;"> There are no details added to your profile yet</span></div>
    </div>`;
  }
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

// check string for rate button
// function searchByName(searchName,pathAddr) {
//   const data = sortRatingByLocalStorage();
//   const searchResult = [];
//   data.forEach((item) => {
//     item.RatedSkills.forEach((skill) => {
//       if (
//         skill.isot_file.path_addr === pathAddr &&
//         skill.isot_file.name.toLowerCase().includes(searchName.toLowerCase())
//       ) {
//         searchResult.push(skill);
//       }
//     });
//   });
//   return searchResult;
// }

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
  console.log(contentToShowInModal, "222222222222");
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
    console.log(obj);
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

// Helper function to create the dropdown (select element)
// function createDropdown() {
//   const dropdown = document.createElement("select");
//   dropdown.style.width = "100%";
//   dropdown.style.padding = "13px";
//   dropdown.style.border = "1px solid #E6E6E6";
//   dropdown.style.borderRadius = "4px";
//   dropdown.style.marginBottom = "10px";
//   dropdown.style.background = "white";
//   dropdown.style.fontSize = "1em";
//   dropdown.style.appearance = "none";
//   dropdown.style.backgroundImage = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;
//   dropdown.style.backgroundRepeat = "no-repeat";
//   dropdown.style.backgroundPosition = "right 9px center";
//   dropdown.style.backgroundSize = "1em";

//   const defaultOption = document.createElement("option");
//   defaultOption.disabled = true;
//   defaultOption.selected = true;
//   defaultOption.value = "";
//   defaultOption.text = "Select Category";
//   dropdown.appendChild(defaultOption);

//   const optionsArray = [
//     "Profile and Occupation",
//     "Knowledge and Skills",
//     "Tools and Technologies",
//     "Activities",
//     "Domain or Context",
//   ];
//   const options = {};

//   optionsArray.forEach((optionText, index) => {
//     options[index + 1] = createDropdownOption(optionText);
//     dropdown.appendChild(options[index + 1]);
//   });

//   return dropdown;
// }

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
  // dropdown.style.backgroundImage = `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;
  // dropdown.style.backgroundRepeat = "no-repeat";
  // dropdown.style.backgroundPosition = "right 9px center";
  // dropdown.style.backgroundSize = "1em";
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

// function addTolocalStorage(userRatedSkill) {
//   // Get the existing list from local storage
//   const existingList = JSON.parse(
//     localStorage.getItem("userRatedSkills") || "[]"
//   );

//   // Check if the userRatedSkill already exists in the list
//   const index = existingList.findIndex(
//     (existingItem) =>
//       existingItem.isot_file_id === userRatedSkill.isot_file_id &&
//       existingItem.isot_file_id === userRatedSkill.isot_file_id
//   );

//   if (index !== -1) {
//     // Remove the existing element from the list
//     existingList.splice(index, 1);
//   }

//   // Add the new userRatedSkill to the list
//   const newList = [...existingList, userRatedSkill];

//   // Save the updated list in localStorage
//   localStorage.setItem("userRatedSkills", JSON.stringify(newList));
// }
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
  const loader = document.createElement("div");
  if (loaderIdentifier !== "notLoadded") {
    // Create and append the loader
    loader.className = "loader";
    loader.style.margin = "20px auto";
    getElementByClass.appendChild(loader);
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
                getElementByClass.removeChild(loader);
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
          getElementByClass.removeChild(loader);
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
        getElementByClass.removeChild(loader);
        getElementByClass.innerHTML = previousContent;
      }
      console.error("Error occurred:", error);
      return { error: error.message };
    }
  } else {
    if (loaderIdentifier !== "notLoadded") {
      getElementByClass.removeChild(loader);
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
  const apiEndpoint = `https://uat-lambdaapi.iysskillstech.com/latest/dev-api/add-skill`;
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
      // toastr.success("New skill element added!");
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

        // this.createSkillPath(cardBodyDiv, response.ancestors);delete
        // if (response.siblings.length > 0) {
        //   this.createSelectSkillsChildBox(this.cardBodyDiv, response.siblings);
        // } else {
        //   this.childrenSkillAPI(skillId);
        // }
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
    // this.createSkillSearchList([]);
    // this.SelectSkill();
    // this.funtional
  }
  createSearchBox() {
    const div = document.createElement("div");
    div.classList.add("input-group", "input-group-lg");
    div.style.display = "flex";
    div.style.flexDirection = "row";
    div.style.borderRadius = "10px";
    div.style.border = "1px solid #007DFC1A";

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
    input.style.fontSize = "15px";
    input.style.height = "auto";
    input.style.borderRadius = "10px";
    // input.style.border = "none";
    input.style.paddingLeft = "50px";
    input.style.paddingTop = "10px";
    input.style.paddingBottom = "10px";
    input.type = "search";
    input.style.background = `transparent url("${imagePath}Group 3.svg")`;
    input.style.backgroundRepeat = "no-repeat";
    input.style.backgroundPositionX = "13px";
    input.style.backgroundPositionY = "center";

    // const iclass=document.createElement("i");
    // iclass.className="fas fa-search";
    // input.appendChild(iclass);
    div.appendChild(input);

    // Create the clear icon
    const clearIcon = document.createElement("span");
    clearIcon.id = "plugin-search-id-close-button";
    clearIcon.innerHTML = "&times;";
    // clearIcon.style.position = "absolute";
    // clearIcon.style.right = "130px";
    // clearIcon.style.top = "20%";
    // clearIcon.style.transform = "translateY(-20%)";
    clearIcon.style.cursor = "pointer";
    clearIcon.style.color = "rgb(255 0 0)";
    clearIcon.style.fontSize = "25px";
    clearIcon.style.display = "none"; // Initially hide the clear icon
    clearIcon.style.textAlign = "right";
    clearIcon.style.padding = "0 20px";

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
      this.skillSelected = false;
      input.value = "";
      divDropDown.style.display = "none";
      button.style.display = "block";
      this.selectedASkillBox.style.display = "none";
      clearIcon.style.display = "none"; // Hide the clear icon after clearing input
    });

    // Append the clear icon to the search box div
    div.appendChild(clearIcon);

    // Format the search text to Title Case
    // const searchText = "search"; // Replace with your desired text
    // const formattedText =
    //   searchText.charAt(0).toUpperCase() + searchText.slice(1).toLowerCase();

    // Create the search button
    // const button = document.createElement("button");
    // button.style.paddingRight = "34px";
    // button.style.paddingLeft = "34px";
    // button.style.borderRadius = "10px";
    // button.style.margin = "6px";
    // button.style.border = "none";
    // button.style.background = "#007DFC";
    // button.style.color = "white";
    // button.style.position = "absolute";
    // button.style.right = "0";
    // button.style.height = "78%";
    // button.style.top = "0px";
    // button.classList.add("d-none", "d-lg-block");
    // button.innerHTML = `${formattedText}`;
    // // button.innerHTML = `<i class="fas fa-search" style="margin-right: 8px;"></i> ${formattedText}`; // Add your icon HTML here
    // button.setAttribute("aria-label", "Search");

    // // Add click event to trigger the searchAPI method
    // button.addEventListener("click", () => {
    //   if (input.value !== "") {
    //     this.searchAPI();
    //   }
    // });

    // div.appendChild(button);

    // Event listener to toggle search button and clear icon based on input content
    input.addEventListener("input", () => {
      const hasInput = input.value.trim() !== "";
      clearIcon.style.display = hasInput ? "block" : "none";
      // button.style.display = hasInput ? "none" : "block";
      divDropDown.style.display = hasInput ? "block" : "none";
      this.selectedASkillBox.style.display = hasInput ? "none" : "block";
    });

    // Initial check to hide search button if the input has content
    if (input.value.trim() !== "") {
      clearIcon.style.display = "block";
      // button.style.display = "none";
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
    divDropDown.style.width = "96.5%";
    divDropDown.style.position = "absolute";
    divDropDown.style.zIndex = "9";
    divDropDown.style.background = "#fff";

    this.selectedDiv.appendChild(divDropDown);
  }

  // setupCreateSearchTriggers() {
  //   const searchBoxElement = document.getElementById("plugin-search-id");
  //   searchBoxElement.addEventListener("input", (event) => {
  //     if (this.skillSelected) {
  //       console.log("Backspace pressed after skill selection. Clearing search box.");
  //         searchBoxElement.value = ""; // Clear search box
  //         this.searchValue = "";
  //         this.skillSelected = false;
  //         document.getElementById("dropdown-plugin-div").style.display = "none";
  //     }
  //     else{
  //       event.preventDefault();
  //       this.isFromSelectBox = false;
  //       this.searchValue = searchBoxElement.value;
  //       if (this.searchValue?.length > 0) {
  //         console.log("searchentered");
  //         this.searchAPI(this.searchValue);
  //       }
  //     }
  //   });
  // }

  setupCreateSearchTriggers() {
    const searchBoxElement = document.getElementById("plugin-search-id");
    searchBoxElement.addEventListener("input", (event) => {
      if (this.skillSelected) {
        console.log("Backspace pressed after skill selection. Clearing search box.");
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
          console.log("searchentered");
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
    div.style.textAlign = "center";
    div.style.padding = "30px";
    div.style.marginBottom = "30px";
    this.searchResultsList = searchResultsList;
    if (searchResultsList.length > 0) {
      const ul = document.createElement("ul");
      // Create buttons after the unordered list
      ul.style.padding = "30px";
      ul.classList.add("dropdown-menu");
      let autoClicked = false;
      // create the list item elements and append them to the unordered list
      for (let i = 0; i < searchResultsList.length; i++) {
        const li = document.createElement("li");
        li.style.color = "#636363";
        li.style.fontSize = "16px";
        // li.style.borderBottom = "1px solid #E0E0E0";
        li.addEventListener("click", (event) => {
          this.skillSelected = true;
          console.log("clicked");
          this.skillClick(i, selectedValue);
          div.style.display = "none";
          this.selectedASkillBox.style.display = "block";
          // remove local storages
          // clearlocalStorage();
        });
        // const addMorePlusIcon =
        //   searchResultsList[i]?.skills[0]?.child_count > 1
        //     ? '<i class="fa fa-plus"></i>'
        //     : "";
        const a = document.createElement("a");
        a.classList.add("dropdown-item");
        a.style.wordWwrap = "break-word";
        a.style.whiteSpace = "pre-wrap";
        a.href = "#";
        // a.innerHTML =
        //   addMorePlusIcon +
        //   " " +
        //   this.searchHighlight(
        //     this.searchValue,
        //     this.getSkillName(searchResultsList[i])
        //   );
        const skillName = this.getSkillName(searchResultsList[i]);
        a.innerHTML = this.searchHighlight(
          this.searchValue,
          this.getSkillName(searchResultsList[i])
        );
        li.appendChild(a);
        ul.appendChild(li);
        if (this.isFromSelectBox && !autoClicked && skillName.trim() === searchText.trim()) {
          li.click(); // Trigger click event
          autoClicked = true; // Prevent multiple clicks
        }
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

    // Create the container for dropdown
    // const inputContainer2 = createInputContainer(
    //   'Category <span style="color:red">*</span>'
    // );
    // Create the dropdown (select element)
    const dropdown = await createDropdown();
    // inputContainer2.appendChild(dropdown);

    // Create error messages
    const emailError = createErrorMessage();
    emailFieldContainer.appendChild(emailError);

    const elementError = createErrorMessage();
    elementFieldContainer.appendChild(elementError);

    const categoryError = createErrorMessage();
    // inputContainer2.appendChild(categoryError);

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
    console.log(this.options);
    let pluginDiv = document.getElementById(this.options.pluginDivId);

    if (pluginDiv) {
      pluginDiv.appendChild(modalDiv);
    } else {
      console.error(`Element with ID ${this.options.pluginDivId} not found.`);
    }
    
    // function showSkillAddedNotification(skillName) {
    //   let notificationDiv = document.getElementById("skill-notification");
    
    //   if (!notificationDiv) {
    //     notificationDiv = document.createElement("div");
    //     notificationDiv.id = "skill-notification";
    //     notificationDiv.style.position = "fixed";
    //     notificationDiv.style.top = "32%";
    //     notificationDiv.style.left = "50%";
    //     notificationDiv.style.transform = "translate(-50%, -50%)";
    //     notificationDiv.style.background = "#4CAF50";
    //     notificationDiv.style.color = "#fff";
    //     notificationDiv.style.padding = "15px 25px";
    //     notificationDiv.style.borderRadius = "8px";
    //     notificationDiv.style.textAlign = "center";
    //     notificationDiv.style.fontSize = "16px";
    //     // notificationDiv.style.fontWeight = "bold";
    //     notificationDiv.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
    //     notificationDiv.style.zIndex = "10000";
    //     notificationDiv.style.fontFamily= "system-ui";
    
    //     if (pluginDiv) {
    //       pluginDiv.appendChild(notificationDiv);
    //     } else {
    //       document.body.appendChild(notificationDiv);
    //     }
    //   }
    
    //   notificationDiv.textContent = `The skill "${skillName}" has been added successfully. Kindly search to add this skill.`;
    //   notificationDiv.style.display = "block";
    
    //   setTimeout(() => {
    //     notificationDiv.style.display = "none";
    //     notificationDiv.remove();
    //   }, 2000);
    // }

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
    // this.searchInputBox.classList.add("loading");
    if (this.currentRequest) {
      this.currentRequest.abort(); // Cancel previous request
    }

    this.currentRequest = new AbortController(); // Create new controller
    const signal = this.currentRequest.signal;

    this.searchInputBox.type = "text";

    const div = document.getElementById("dropdown-plugin-div");
    div.style.padding = "30px";
    div.style.minHeight = "auto";
    div.style.maxHeight = "290px";
    div.style.overflow = "auto";

    // Create and append the loader while waiting for the API response

    const loader = document.createElement("div");
    loader.className = "loader";

    div.innerHTML = ""; // Clear previous content
    div.appendChild(loader);
    const encodedSearchValue = encodeURIComponent(this.searchValue.trim());
    let apiUrl = `${ENDPOINT_URL}?q=${encodedSearchValue}&limit=10`;
    if (skillId) {
        apiUrl += `&path=${skillId}`;
    }

    if(selectedValue){
      this.isFromSelectBox = true;
    }

    if (isLoginUser && this.searchValue.length > 0) {
      let authApiUrl = `https://uat-api.myskillsplus.com/api-search/?q=${encodedSearchValue}`;
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
          // if (this.searchValue == response.query) {
            this.createSkillSearchList(response.matches, this.searchValue, selectedValue);
          // }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        })
        .finally(() => {
          // Remove the loader when the API call is complete
          // div.removeChild(loader);
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
          // if (this.searchValue == response.query) {
            this.createSkillSearchList(
              response.matches,
              this.searchValue.trim(),
              selectedValue
            );
          // }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        })
        .finally(() => {
          // Remove the loader when the API call is complete
          // div.removeChild(loader);
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
      console.log("updatinf thing thignd");
      // replace with local storage
      localStorage.setItem(
        "userRatedSkills",
        JSON.stringify(this.options.skillsData)
      );
    }
    if (this.options?.showProfilerOnly == true) {
      console.log("showProfilerOnly");
    }

    this.fillStarImageUrl =
      "https://i.ibb.co/zxrDfTN/Screenshot-from-2023-04-29-09-48-17.png";
    this.emptyStarImageUrl =
      "https://i.ibb.co/XC1pj0h/Screenshot-from-2023-04-29-09-49-11.png";

    this.ratedSelectedSkills = [];
    this.showPopup = this.showPopup.bind(this);
    this.saveTheSkillComment = this.saveTheSkillComment.bind(this);
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
    // okButton.style.padding = "5px 10px";
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
    // popup.style.left = `${rect.left + window.scrollX}px`;
    // popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight - 10}px`;
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

    // // Create nav element
    // var navElement = document.createElement("nav");
    // navElement.className = "mb-3 border-bottom";
    // navElement.style = "padding-bottom: 1px";

    // // Create container div
    // var containerDiv = document.createElement("div");
    // containerDiv.className = "container-fluid d-flex";

    // // Create button container div
    // var buttonContainerDiv = document.createElement("div");

    // // Create ul element
    // var ulElement = document.createElement("ul");
    // ulElement.className = "nav nav-tabs";
    // ulElement.id = "myTab0";

    // // Create home tab li element
    // var homeLi = document.createElement("li");
    // homeLi.className = "nav-item";
    // var homeButton = document.createElement("button");
    // homeButton.setAttribute("data-mdb-tab-init", "");
    // homeButton.className = "nav-link px-4 py-3 active";
    // homeButton.id = "home-tab0";
    // homeButton.setAttribute("data-mdb-target", "#home0");
    // homeButton.type = "button";
    // homeButton.setAttribute("role", "tab");
    // homeButton.setAttribute("aria-controls", "home");
    // homeButton.setAttribute("aria-selected", "true");
    // var homeIconDiv = document.createElement("div");
    // homeIconDiv.className = "d-flex flex-row align-items-center gap-2";
    // var homeIcon = document.createElement("i");
    // homeIcon.className = "fa fa-xl fa-search py-2";
    // var homeSmall = document.createElement("small");
    // homeSmall.textContent = "Search";
    // homeIconDiv.appendChild(homeIcon);
    // homeIconDiv.appendChild(homeSmall);
    // homeButton.appendChild(homeIconDiv);
    // homeLi.appendChild(homeButton);

    // // Create profile tab li element
    // var profileLi = document.createElement("li");
    // profileLi.className = "nav-item";
    // var profileButton = document.createElement("button");
    // profileButton.setAttribute("data-mdb-tab-init", "");
    // profileButton.className = "nav-link px-4 py-3";
    // profileButton.id = "profile-tab0";
    // profileButton.setAttribute("data-mdb-target", "#profile0");
    // profileButton.type = "button";
    // profileButton.setAttribute("role", "tab");
    // profileButton.setAttribute("aria-controls", "profile");
    // profileButton.setAttribute("aria-selected", "false");
    // var profileIconDiv = document.createElement("div");
    // profileIconDiv.className = "d-flex flex-row align-items-center gap-2";
    // var profileIcon = document.createElement("i");
    // profileIcon.className = "fa fa-xl fa-user py-2";
    // var profileSmall = document.createElement("small");
    // profileSmall.textContent = "Profile";
    // profileIconDiv.appendChild(profileIcon);
    // profileIconDiv.appendChild(profileSmall);
    // profileButton.appendChild(profileIconDiv);
    // profileLi.appendChild(profileButton);

    // // Append li elements to ul element
    // ulElement.appendChild(homeLi);
    // ulElement.appendChild(profileLi);

    // // Append ul element to button container div
    // buttonContainerDiv.appendChild(ulElement);

    // // Append button container div to container div
    // containerDiv.appendChild(buttonContainerDiv);

    // // Append container div to nav element
    // navElement.appendChild(containerDiv);

    // var navElement = document.createElement("nav");
    // navElement.style = "padding-top:20px; padding-left:10px; margin-left:5px; display: none;";

    // var containerDiv = document.createElement("div");
    // containerDiv.className = "container-fluid d-flex";

    // var buttonContainerDiv = document.createElement("div");
    // buttonContainerDiv.style = "margin-left:auto;";

    // var ulElement = document.createElement("ul");
    // ulElement.className = "nav nav-tabs";
    // ulElement.id = "myTab0";

    // // Create home tab
    // var homeTab = createTab(
    //   "home",
    //   "Search",
    //   `${imagePath}Group 1.svg`,
    //   "#E8F2FF",
    //   "#024FAB"
    // );

    // // Profile tab
    // var profileTab = createTab(
    //   "profile",
    //   "View Profile",
    //   `${imagePath}Group 2.svg`,
    //   "#E8F2FF",
    //   "#024FAB"
    // );

    // // Append li elements to ul element
    // if (iysplugin.tap == "all" || iysplugin.tap == "search") {
    //   ulElement.appendChild(homeTab);
    //   ulElement.appendChild(profileTab);
    // }

    // buttonContainerDiv.appendChild(ulElement);
    // containerDiv.appendChild(buttonContainerDiv);
    // navElement.appendChild(containerDiv);

    // cardDiv.appendChild(navElement);

    // Function to create tab button
    // function createTab(id, labelText, imagePath, backgroundColor, color) {
    //   var liElement = document.createElement("li");
    //   liElement.className = "nav-item";

    //   var button = document.createElement("button");
    //   button.setAttribute("data-mdb-tab-init", "");
    //   if (id == "home") {
    //     button.style.display = "none";
    //     button.className = "nav-link px-3 active";
    //   } else {
    //     button.className = "nav-link px-3";
    //   }
    //   button.id = id + "-tab0";
    //   button.setAttribute("data-mdb-target", "#" + id + "0");
    //   button.style.paddingTop = "0.6rem";
    //   button.style.paddingBottom = "0.5rem";
    //   button.style.textAlign = "center";
    //   button.style.color = color;
    //   button.type = "button";
    //   button.setAttribute("role", "tab");
    //   button.setAttribute("aria-controls", id);
    //   button.style.background = backgroundColor;
    //   button.style.borderRadius = "30px";
    //   button.style.marginRight = "10px";

    //   var iconDiv = document.createElement("div");
    //   iconDiv.className = "d-flex flex-row align-items-center gap-2";

    //   var img = document.createElement("img");
    //   img.src = imagePath;
    //   img.alt = labelText + " icon";
    //   img.style.width = "20px";
    //   img.style.height = "20px";
    //   // img.className = "py-2";

    //   var small = document.createElement("small");
    //   small.textContent = labelText;

    //   iconDiv.appendChild(img);
    //   iconDiv.appendChild(small);
    //   button.appendChild(iconDiv);
    //   liElement.appendChild(button);

    //   button.addEventListener("click", function () {
    //     toggleButtons(id);
    //   });

    //   return liElement;
    // }

    // function toggleButtons(activeId) {
    //   var homeButton = document.getElementById("home-tab0");
    //   var profileButton = document.getElementById("profile-tab0");

    //   if (activeId === "home") {
    //     homeButton.style.display = "none";
    //     profileButton.style.display = "block";
    //   } else if (activeId === "profile") {
    //     profileButton.style.display = "none";
    //     homeButton.style.display = "block";
    //   }
    // }

    // Append nav element to card div
    // cardDiv.appendChild(navElement);

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
    // skillGroupDiv.className="my-3";
    skillGroupDiv.style =
      "margin-top:1rem; padding-right:7px; padding-left:7px; display:flex; justify-content:center; align-items:center;";

    var skillGroupNavDiv = document.createElement("div");
    skillGroupNavDiv.className = "nav nav-pills m-0";
    skillGroupNavDiv.id = "skillsTab";
    // skillGroupNavDiv.style =
    //   "box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 10px; width:100%;";
    skillGroupNavDiv.style =
      "width:100%;";

    var skillGroupButton = document.createElement("div");
    skillGroupButton.className = "skillgroupbutton d-flex";
    skillGroupButton.setAttribute("role", "group");
    skillGroupButton.setAttribute("aria-label", "Three views");
    skillGroupButton.style =
      "padding-right: 6px; padding-left:6px; padding-top:2px; padding-bottom:2px; width:100%;";

    // // Create the select box container
    // var selectboxDiv = document.createElement("div");
    // selectboxDiv.className = "selectbox-container";
    // selectboxDiv.style.position = "relative";
    // selectboxDiv.style.padding = "5px";
    // selectboxDiv.style.fontFamily = "system-ui";
    // selectboxDiv.style.borderRadius = "5px";

    // var searchContainer = document.createElement("div");
    // searchContainer.className ="button-container responsive-button-container category-container";
    // searchContainer.style="padding: 10px; border-radius: 10px; width:300px;";
    // selectboxDiv.appendChild(searchContainer);

    // // Create the label
    // var searchLabel = document.createElement("label");
    // searchLabel.textContent = "Select Category";
    // searchLabel.style.display = "block";
    // searchLabel.style.fontWeight = "bold";
    // searchLabel.style.marginBottom = "5px";
    // searchContainer.appendChild(searchLabel);

    // // Create the search box
    // let debounceTimer;
    // let activeFetchRequest = null;

    // var searchBox = document.createElement("input");
    // searchBox.type = "text";
    // searchBox.placeholder = "Search skills...";
    // searchBox.className = "search-input";
    // searchBox.style.width = "100%";
    // searchBox.style.padding = "5px";
    // searchBox.style.border = "1px solid #ccc";
    // searchBox.style.borderRadius = "5px";
    // searchBox.style.fontSize = "16px";
    // searchBox.style.boxSizing = "border-box";
    // searchBox.addEventListener("focus", function () {
    //     // softskillDropdownMenu.style.display = "none";
    //     // softskillSearchBox.value = "";
    //     fetchSkills("");
    // });
    // searchBox.addEventListener("input", function () {
    //     clearTimeout(debounceTimer);
    //     // softskillDropdownMenu.style.display = "none";
    //     // softskillSearchBox.value = "";
    //     debounceTimer = setTimeout(() => {
    //       fetchSkills(searchBox.value);
    //     }, 300);
    // });
    // searchContainer.appendChild(searchBox);

    // // Create the dropdown menu
    // var dropdownMenu = document.createElement("div");
    // dropdownMenu.className = "dropdown-menu";
    // dropdownMenu.style.width = "100%";
    // dropdownMenu.style.border = "1px solid #ccc";
    // dropdownMenu.style.borderRadius = "5px";
    // dropdownMenu.style.backgroundColor = "#fff";
    // // dropdownMenu.style.marginTop = "5px";
    // dropdownMenu.style.display = "none";
    // dropdownMenu.style.position = "absolute";
    // dropdownMenu.style.zIndex = "1000";
    // dropdownMenu.style.maxHeight = "250px";
    // dropdownMenu.style.overflowY = "auto";
    // dropdownMenu.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";

    // var loadingIndicator = document.createElement("div");
    // loadingIndicator.textContent = "Loading...";
    // loadingIndicator.style.padding = "10px";
    // loadingIndicator.style.textAlign = "center";
    // loadingIndicator.style.display = "none"; // Initially hidden
    // dropdownMenu.appendChild(loadingIndicator);

    // searchContainer.appendChild(dropdownMenu);
    
    // function fetchSkills(query) {
    //   if (activeFetchRequest) {
    //     activeFetchRequest.abort(); // Abort the previous request if exists
    //   }
    //   loadingIndicator.style.display = "block";
    //   dropdownMenu.innerHTML = "";
    //   dropdownMenu.appendChild(loadingIndicator);

    //   let controller = new AbortController();
    //   activeFetchRequest = controller;

    //   if (!query) {
    //       console.log("Fetching all top-level skills...");
    //       fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/search-category-skills/?limit=10`,{ signal: controller.signal })
    //           .then(response => response.json())
    //           .then(response => {
    //               dropdownMenu.innerHTML = "";
    //               if (response.matches.length > 0) {
    //                 let allSkills = [];
    
    //                 response.matches.forEach(match => {
    //                     allSkills.push(...match.skills);
    //                 });

    //                 let sortedSkills = allSkills.sort((a, b) => {
    //                     let orderA = a.display_order !== null ? a.display_order : Infinity;
    //                     let orderB = b.display_order !== null ? b.display_order : Infinity;
    //                     return orderA - orderB;
    //                 });
    
    //                 sortedSkills.forEach(skill => {
    //                     let item = createDropdownItem(skill);
    //                     dropdownMenu.appendChild(item);
    //                 });
    
    //                 dropdownMenu.style.display = "block";
    //               } else {
    //                 dropdownMenu.style.display = "none";
    //               }
    //           })
    //           .finally(() => {
    //             activeFetchRequest = null; // Reset active request
    //             loadingIndicator.style.display = "none"; // Hide loader
    //           });
    //   } else {
    //       console.log("Searching for:", query);
    //       fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/search-category-skills/?q=${encodeURIComponent(query)}&limit=10`,{ signal: controller.signal })
    //           .then(response => response.json())
    //           .then(response => {
    //               dropdownMenu.innerHTML = "";
    //               if (response.matches.length > 0) {
    //                 let allSkills = [];
                
    //                 response.matches.forEach(match => {
    //                     allSkills.push(...match.skills);
    //                 });
                
    //                 // Sort skills by display_order, treating null as the largest value
    //                 let sortedSkills = allSkills.sort((a, b) => {
    //                     let orderA = a.display_order !== null ? a.display_order : Infinity;
    //                     let orderB = b.display_order !== null ? b.display_order : Infinity;
    //                     return orderA - orderB;
    //                 });
                
    //                 sortedSkills.forEach(skill => {
    //                     let skillPathParts = skill.path_addr.split(".");
                
    //                     if (skillPathParts.length > 1 && skill.path_addr[0] !== ".") {
    //                         // Fetch all ancestors and expand them in order
    //                         fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/cat-tree/?path_addr=${skill.path_addr}`)
    //                             .then(res => res.json())
    //                             .then(treeData => {
    //                                 if (treeData.ancestors.length > 0) {
    //                                     expandAncestors(treeData.ancestors, skill.name);
    //                                 }
    //                             });
    //                     } else {
    //                         let item = createDropdownItem(skill);
    //                         dropdownMenu.appendChild(item);
    //                     }
    //                 });
                
    //                 dropdownMenu.style.display = "block";
    //               } else {
    //                 dropdownMenu.style.display = "none";
    //               }
    //           })
    //           .finally(() => {
    //             activeFetchRequest = null;
    //             loadingIndicator.style.display = "none";
    //           });
    //   }
    // }
  
    // function expandAncestors(ancestors, highlightSkill) {
    //   if (ancestors.length === 0) return;
  
    //   let parentSkill = ancestors.shift(); // Get the first ancestor
  
    //   let existingParentItem = document.querySelector(`[data-path-addr="${parentSkill.path_addr}"]`);
    //   if (!existingParentItem) {
    //       let parentItem = createDropdownItem(parentSkill);
    //       dropdownMenu.appendChild(parentItem);
    //   }
  
    //   let parentItem = document.querySelector(`[data-path-addr="${parentSkill.path_addr}"]`);
    //   if (parentItem) {
    //       let arrow = parentItem.querySelector("span:last-child");
    //       toggleChildren(parentSkill.path_addr, parentItem, arrow, highlightSkill);
  
    //       // Recursively expand the next ancestor
    //       setTimeout(() => expandAncestors(ancestors, highlightSkill), 500); 
    //   }
    // }
  
    // function createDropdownItem(skill) {
    //     let item = document.createElement("div");
    //     item.className = "dropdown-item";
    //     item.setAttribute("data-path-addr", skill.path_addr);
    //     item.style.padding = "10px";
    //     item.style.cursor = "pointer";
    //     item.style.display = "flex";
    //     item.style.justifyContent = "space-between";
    //     item.style.alignItems = "center";
    //     item.style.border = "1px solid #eee";
    //     item.style.transition = "background 0.3s";
    //     item.style.borderRadius = "5px";
        
    //     let skillText = document.createElement("span");
    //     skillText.textContent = skill.name;
    //     if(skill.name.length > 30){
    //       skillText.style ="display: inline-block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: top";
    //       manageTooltip(skillText,skill.name);
    //     }
    //     skillText.style.fontWeight = "bold";
    //     item.appendChild(skillText);
        
    //     if (skill.child_count > 0) {
    //         var arrow = document.createElement("span");
    //         arrow.textContent = ">";
    //         arrow.style.cursor = "pointer";
    //         arrow.onclick = function (event) {
    //             item.style.backgroundColor="#f0f8ff";
    //             event.stopPropagation();
    //             toggleChildren(skill.path_addr, item, arrow);
    //         };
    //         item.appendChild(arrow);
    //     }

    //     item.addEventListener("click", function () {
    //         if (skill.child_count === 0) {
    //             console.log("not children skill is clicked");
    //             document.getElementById("plugin-search-id").value = skill.name;
    //             searchBox.value = skill.name;
    //             dropdownMenu.style.display = "none";
    //         } else {
    //             item.style.backgroundColor="#f0f8ff";
    //             toggleChildren(skill.path_addr, item, arrow);
    //         }
    //     });
    //     return item;
    // }

    // function toggleChildren(pathAddr, parentItem, arrow, highlightSkill = null) {
    //   var existingChildContainer = parentItem.nextElementSibling;
    //   if (existingChildContainer && existingChildContainer.classList.contains("child-menu")) {
    //       existingChildContainer.remove();
    //       parentItem.style.backgroundColor = "#ffff";
    //       if (arrow) arrow.textContent = ">";
    //       return;
    //   }
  
    //   fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/cat-children/?path_addr=${pathAddr}&limit=200&offset=0`)
    //       .then(response => response.json())
    //       .then(children => {
    //           if (!children.length) return;
    //           let sortedChildren = children.sort((a, b) => {
    //             let orderA = a.display_order !== null ? a.display_order : Infinity;
    //             let orderB = b.display_order !== null ? b.display_order : Infinity;
    //             return orderA - orderB;
    //           });
    //           var childContainer = document.createElement("div");
    //           childContainer.className = "child-menu";
    //           childContainer.style.padding = "5px";
    //           childContainer.style.paddingLeft = "15px";
  
    //           sortedChildren.forEach(child => {
    //               var childItem = document.createElement("div");
    //               childItem.className = "dropdown-item";
    //               childItem.setAttribute("data-path-addr", child.path_addr);
    //               childItem.style.padding = "8px";
    //               childItem.style.cursor = "pointer";
    //               childItem.style.display = "flex";
    //               childItem.style.justifyContent = "space-between";
    //               childItem.style.alignItems = "center";
    //               childItem.style.backgroundColor = "#fff";
    //               childItem.style.border = "1px solid #ddd";
    //               childItem.style.borderRadius = "5px";
  
    //               var skillText = document.createElement("span");
    //               skillText.textContent = child.name;
    //               if(child.name.length > 25){
    //                 skillText.style ="display: inline-block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; vertical-align: top";
    //                 manageTooltip(skillText,child.name);
    //               }
    //               skillText.style.fontWeight = "bold";
    //               childItem.appendChild(skillText);
  
    //               // let hasCatTag = child.tags && child.tags.some(tag => tag.title === "Cat");
    //               if (child.child_count > 0) {
    //                   var childArrow = document.createElement("span");
    //                   childArrow.textContent = ">";
    //                   childArrow.style.cursor = "pointer";
    //                   childArrow.onclick = function (event) {
    //                       childItem.style.backgroundColor="#f0f8ff";
    //                       event.stopPropagation();
    //                       toggleChildren(child.path_addr, childItem, childArrow);
    //                   };
    //                   childItem.appendChild(childArrow);
    //               }
  
    //               childItem.addEventListener("click", function () {
    //                   if (child.child_count === 0) {
    //                     document.getElementById("plugin-search-id").value = child.name;
    //                     searchBox.value = child.name;
    //                     dropdownMenu.style.display = "none";
    //                   } else {
    //                     childItem.style.backgroundColor="#f0f8ff";
    //                     toggleChildren(child.path_addr, childItem, childArrow);
    //                   }
    //               });
  
    //               // Highlight the searched skill
    //               if (highlightSkill && child.name === highlightSkill) {
    //                   childItem.style.backgroundColor = "#f0f8ff";
    //               }
  
    //               childContainer.appendChild(childItem);
    //           });
  
    //           if (parentItem.parentNode) {
    //             parentItem.parentNode.insertBefore(childContainer, parentItem.nextSibling);
    //             if (arrow) arrow.textContent = ">>";
    //           }
    //       });
    // }

    // Create the select box container
    var selectboxDiv = document.createElement("div");
    selectboxDiv.className = "selectbox-container";
    selectboxDiv.style.position = "relative";
    // selectboxDiv.style.padding = "7px";
    selectboxDiv.style.fontFamily = "system-ui";
    // selectboxDiv.style.borderRadius = "5px";
    selectboxDiv.style.width = "100%";

    // var searchContainer = document.createElement("div");
    // searchContainer.className ="button-container responsive-button-container category-container";
    // searchContainer.style="padding: 10px; border-radius: 10px; width:100%;";
    // selectboxDiv.appendChild(searchContainer);

    // Create the label
    var searchLabel = document.createElement("label");
    searchLabel.textContent = "Select Function/Industry";
    searchLabel.style.display = "block";
    searchLabel.style.fontWeight = "bold";
    searchLabel.style.marginBottom = "5px";
    selectboxDiv.appendChild(searchLabel);
    searchLabel.style.fontSize = "15px";

    // Create the search box
    let debounceTimer;
    let activeFetchRequest = null;

    var searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.placeholder = "In category search";
    searchBox.className = "search-input";
    searchBox.style.width = "100%";
    searchBox.style.padding = "10px";
    searchBox.style.border = "1px solid #ccc";
    searchBox.style.borderRadius = "10px";
    searchBox.style.fontSize = "15px";
    searchBox.style.boxSizing = "border-box";
    searchBox.addEventListener("focus", () => {
        fetchSkills("");
        const dropdownMenu = document.getElementById("skills-horizontal-menu");
        dropdownMenu.style.display = "block"; // Show the dropdown
    });
    searchBox.addEventListener("input", function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          fetchSkills(searchBox.value);
        }, 300);
    });
    selectboxDiv.appendChild(searchBox);

    // Create the dropdown menu container
    var dropdownMenu = document.createElement("div");
    dropdownMenu.id = "skills-horizontal-menu";
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.style.width = "100%";
    dropdownMenu.style.border = "1px solid #ccc";
    dropdownMenu.style.borderRadius = "5px";
    dropdownMenu.style.backgroundColor = "#fff";
    dropdownMenu.style.display = "none";
    adjustCardBodyMargin();
    dropdownMenu.style.position = "absolute";
    dropdownMenu.style.zIndex = "1000";
    dropdownMenu.style.maxHeight = "250px";
    dropdownMenu.style.overflowY = "auto";
    dropdownMenu.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    dropdownMenu.style.padding = "10px";
    dropdownMenu.style.flexWrap = "wrap";
    dropdownMenu.style.gap = "8px";

    // Breadcrumb container
    var breadcrumbContainer = document.createElement("div");
    breadcrumbContainer.id = "breadcrumb-container";
    breadcrumbContainer.style.display = "none";
    breadcrumbContainer.style.marginBottom = "10px";
    breadcrumbContainer.style.alignItems = "center";
    breadcrumbContainer.style.flexWrap = "wrap";
    breadcrumbContainer.style.gap = "5px";
    dropdownMenu.appendChild(breadcrumbContainer);

    // Create the skills container (horizontal layout)
    var skillsContainer = document.createElement("div");
    // skillsContainer.style.display = "flex";
    skillsContainer.style.flexWrap = "wrap";
    skillsContainer.style.gap = "8px";
    skillsContainer.id = "skills-container";
    dropdownMenu.appendChild(skillsContainer);

    // Loading indicator
    var loadingIndicator = document.createElement("div");
    loadingIndicator.textContent = "Loading...";
    loadingIndicator.style.padding = "10px";
    loadingIndicator.style.textAlign = "center";
    loadingIndicator.style.display = "none";
    dropdownMenu.appendChild(loadingIndicator);

    selectboxDiv.appendChild(dropdownMenu);

    // Function to create a breadcrumb item
    function createBreadcrumbItem(skill, isLast = false) {
        const breadcrumbItem = document.createElement("span");
        breadcrumbItem.textContent = skill.name;
        breadcrumbItem.style.cursor = "pointer";
        breadcrumbItem.style.color = isLast ? "#333" : "#0066cc";
        breadcrumbItem.style.fontWeight = isLast ? "bold" : "normal";
        
        if (!isLast) {
            breadcrumbItem.addEventListener("click", (event) => {
              event.stopPropagation();
              fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/cat-tree/?path_addr=${skill.path_addr}`)
                  .then(res => res.json())
                  .then(treeData => {
                      if (treeData.ancestors.length > 0) {
                          updateBreadcrumbs(treeData.ancestors, skill);
                      } else {
                          updateBreadcrumbs([], skill);
                      }
                      fetchSkillsByPath(skill.path_addr);
                  });
            });
        }
        
        return breadcrumbItem;
    }

    // Function to update breadcrumbs
    function updateBreadcrumbs(ancestors, currentSkill) {
        breadcrumbContainer.innerHTML = "";
        breadcrumbContainer.style.display = "flex";
        
        // // Add home breadcrumb
        // const homeBreadcrumb = document.createElement("span");
        // homeBreadcrumb.textContent = "All Categories";
        // homeBreadcrumb.style.cursor = "pointer";
        // homeBreadcrumb.style.color = "#0066cc";
        // homeBreadcrumb.addEventListener("click", () => {
        //     fetchSkills(searchBox.value);
        //     breadcrumbContainer.style.display = "none";
        // });
        // breadcrumbContainer.appendChild(homeBreadcrumb);
        
        // // Add separator
        // const separator = document.createElement("span");
        // separator.textContent = ">";
        // separator.style.margin = "0 5px";
        // breadcrumbContainer.appendChild(separator);
        
        // Add ancestor breadcrumbs
        ancestors.forEach((ancestor, index) => {
            const isLast = index === ancestors.length - 1;
            const isDuplicate = currentSkill && ancestor.path_addr === currentSkill.path_addr;
            if (isDuplicate) return;
            const item = createBreadcrumbItem(ancestor);
            breadcrumbContainer.appendChild(item);
            
            // Add separator
            const sep = document.createElement("span");
            sep.textContent = ">";
            sep.style.margin = "0 5px";
            breadcrumbContainer.appendChild(sep);
        });
        
        // Add current skill if provided
        if (currentSkill) {
            const currentItem = createBreadcrumbItem(currentSkill, true);
            breadcrumbContainer.appendChild(currentItem);
        }
    }

    // Function to fetch skills by path
    function fetchSkillsByPath(pathAddr) {
        if (activeFetchRequest) {
            activeFetchRequest.abort();
        }
        
        loadingIndicator.style.display = "block";
        skillsContainer.innerHTML = "";
        
        let controller = new AbortController();
        activeFetchRequest = controller;
        
        fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/cat-children/?path_addr=${pathAddr}&limit=200&offset=0`, 
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
                
                sortedChildren.forEach(child => {
                    const pill = createSkillPill(child);
                    skillsContainer.appendChild(pill);
                });
                
                dropdownMenu.style.display = "block";
                adjustCardBodyMargin();
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Error fetching skills:", error);
                }
            })
            .finally(() => {
                activeFetchRequest = null;
                loadingIndicator.style.display = "none";
            });
    }

    // Funtion to  fetchSkills
    function fetchSkills(query) {
      if (activeFetchRequest) {
          activeFetchRequest.abort();
      }
      
      loadingIndicator.style.display = "block";
      skillsContainer.innerHTML = "";
      breadcrumbContainer.style.display = "none";
      
      let controller = new AbortController();
      activeFetchRequest = controller;
      
      const url = query 
          ? `https://uat-lambdaapi.iysskillstech.com/latest/dev-api/search-category-skills/?q=${encodeURIComponent(query)}&limit=10`
          : `https://uat-lambdaapi.iysskillstech.com/latest/dev-api/search-category-skills/?limit=10`;
      
      fetch(url, { signal: controller.signal })
          .then(response => response.json())
          .then(response => {
              skillsContainer.innerHTML = "";
              if (response.matches.length > 0) {
                  let allSkills = [];
                  // let skillsWithPaths = [];
                  
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
                    Promise.all(sortedSkills.map(skill => {
                      return fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/cat-tree/?path_addr=${skill.path_addr}`)
                          .then(res => res.json())
                          .then(treeData => {
                              return {
                                  skill: skill,
                                  ancestors: treeData.ancestors,
                                  current: treeData.current
                              };
                          });
                    })).then(skillsWithPaths => {
                        // Create a container for each matched skill with its full path
                        // skillsWithPaths.forEach(({skill, ancestors, current}) => {
                        //     // Create breadcrumb container for this skill
                        //     var breadcrumbContainer = document.createElement("div");
                        //     breadcrumbContainer.id = "breadcrumb-container";
                        //     breadcrumbContainer.style.display = "none";
                        //     breadcrumbContainer.style.marginBottom = "10px";
                        //     breadcrumbContainer.style.alignItems = "center";
                        //     breadcrumbContainer.style.flexWrap = "wrap";
                        //     breadcrumbContainer.style.gap = "5px";
                        //     breadcrumbContainer.innerHTML = "";
                        //     breadcrumbContainer.style.display = "flex";
                                  
                        //     // Add home breadcrumb
                        //     const homeBreadcrumb = document.createElement("span");
                        //     homeBreadcrumb.textContent = "All Categories";
                        //     homeBreadcrumb.style.cursor = "pointer";
                        //     homeBreadcrumb.style.color = "#0066cc";
                        //     homeBreadcrumb.addEventListener("click", () => {
                        //         fetchSkills("");
                        //         breadcrumbContainer.style.display = "none";
                        //     });
                        //     breadcrumbContainer.appendChild(homeBreadcrumb);
                            
                        //     if (ancestors.length > 0) {
                        //       const separator = document.createElement("span");
                        //       separator.textContent = ">";
                        //       separator.style.margin = "0 5px";
                        //       breadcrumbContainer.appendChild(separator);

                        //       ancestors.forEach((ancestor, index) => {
                        //         const breadcrumbItem = document.createElement("span");
                        //         breadcrumbItem.textContent = ancestor.name;
                        //         breadcrumbItem.style.cursor = "pointer";
                        //         breadcrumbItem.style.color = "#0066cc";
                        //         breadcrumbItem.style.fontWeight = "normal";

                        //         breadcrumbItem.addEventListener("click", (e) => {
                        //           e.stopPropagation();
                        //           fetchSkillsByPath(ancestor.path_addr);
                        //         });

                        //         breadcrumbContainer.appendChild(breadcrumbItem);
                                  
                        //           if (index < ancestors.length - 1 ||current) {
                        //             const sep = document.createElement("span");
                        //             sep.textContent = ">";
                        //             sep.style.margin = "0 5px";
                        //             breadcrumbContainer.appendChild(sep);
                        //           }
                        //       });
                              
                        //         skillsContainer.appendChild(breadcrumbContainer);
                        //       }
                              
                        //       // Show all skills in this group
                        //       // sortedSkills.forEach(skill => {
                        //           const pill = createSkillPill(skill, skill.name.toLowerCase().includes(query.toLowerCase()));
                        //           skillsContainer.appendChild(pill);
                        //       // });
                        // });
                        const skillsGroupedByParent = {};
                        skillsWithPaths.forEach(({skill, ancestors}) => {
                          const parentPathAddr = ancestors.length > 0
                              ? ancestors[ancestors.length - 1].path_addr
                              : skill.path_addr;
                      
                          if (!skillsGroupedByParent[parentPathAddr]) {
                              skillsGroupedByParent[parentPathAddr] = {
                                  ancestors,
                                  matchedSkills: []
                              };
                          }
                      
                          skillsGroupedByParent[parentPathAddr].matchedSkills.push(skill);
                        });
                        
                        Object.entries(skillsGroupedByParent).forEach(([parentPathAddr, {ancestors, matchedSkills}]) => {
                          fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/cat-children/?path_addr=${parentPathAddr}&limit=200&offset=0`)
                              .then(res => res.json())
                              .then(siblingSkills => {
                                  const sortedSiblings = siblingSkills.sort((a, b) => {
                                      let orderA = a.display_order !== null ? a.display_order : Infinity;
                                      let orderB = b.display_order !== null ? b.display_order : Infinity;
                                      return orderA - orderB;
                                  });
                      
                                  //breadcrumb
                                  const breadcrumbContainer = document.createElement("div");
                                  breadcrumbContainer.style.display = "flex";
                                  breadcrumbContainer.style.flexWrap = "wrap";
                                  breadcrumbContainer.style.alignItems = "center";
                                  breadcrumbContainer.style.marginBottom = "10px";
                                  breadcrumbContainer.style.gap = "5px";
                      
                                  // const homeBreadcrumb = document.createElement("span");
                                  // homeBreadcrumb.textContent = "All Categories";
                                  // homeBreadcrumb.style.cursor = "pointer";
                                  // homeBreadcrumb.style.color = "#0066cc";
                                  // homeBreadcrumb.addEventListener("click", () => {
                                  //     fetchSkills("");
                                  //     breadcrumbContainer.style.display = "none";
                                  // });
                                  // breadcrumbContainer.appendChild(homeBreadcrumb);
                      
                                  ancestors.forEach((ancestor, index) => {
                                      if (index > 0) {
                                        const sep = document.createElement("span");
                                        sep.textContent = ">";
                                        sep.style.margin = "0 5px";
                                        breadcrumbContainer.appendChild(sep);
                                      }
                      
                                      const ancestorItem = document.createElement("span");
                                      ancestorItem.textContent = ancestor.name;
                                      ancestorItem.style.cursor = "pointer";
                                      ancestorItem.style.color = "#0066cc";
                                      ancestorItem.addEventListener("click", () => {
                                          updateBreadcrumbs(ancestors.slice(0, index + 1), ancestor);
                                          fetchSkillsByPath(ancestor.path_addr);
                                      });
                                      breadcrumbContainer.appendChild(ancestorItem);
                                  });
                      
                                  skillsContainer.appendChild(breadcrumbContainer);
                      
                                  //sibling with matched skills highlighted
                                  sortedSiblings.forEach(sibling => {
                                      const isMatched = matchedSkills.some(ms => ms.path_addr === sibling.path_addr);
                                      const pill = createSkillPill(sibling, isMatched);
                                      skillsContainer.appendChild(pill);
                                  });
                      
                                  dropdownMenu.style.display = "block";
                                  adjustCardBodyMargin();
                              });
                        });
                      });
                  } else {
                      sortedSkills.forEach(skill => {
                          const pill = createSkillPill(skill);
                          skillsContainer.appendChild(pill);
                      });
                      dropdownMenu.style.display = "block";
                      adjustCardBodyMargin();
                  }
              } else {
                  dropdownMenu.style.display = "none";
                  adjustCardBodyMargin();
              }
          })
          .catch(error => {
              if (error.name !== 'AbortError') {
                  console.error("Error fetching skills:", error);
              }
          })
          .finally(() => {
              activeFetchRequest = null;
              loadingIndicator.style.display = "none";
          });
    }

    // Function to createSkillPill function to handle highlighting
    function createSkillPill(skill, isHighlighted = false) {
      const pill = document.createElement("div");
      pill.className = "skill-pill";
      pill.setAttribute("data-path-addr", skill.path_addr);
      pill.style.display = "inline-flex";
      pill.style.alignItems = "center";
      pill.style.padding = "6px 12px";
      pill.style.backgroundColor = isHighlighted ? "#e6f2ff" : "rgb(255, 255, 255)";
      pill.style.border = "1px solid rgb(79, 79, 79)";
      pill.style.color = "rgb(79, 79, 79)";
      pill.style.fontSize = "14px";
      pill.style.fontWeight = "500";
      pill.style.borderRadius = "20px";
      pill.style.cursor = "pointer";
      pill.style.marginRight = "8px";
      pill.style.marginBottom = "8px";
      pill.style.transition = "background-color 0.2s";
      if (isHighlighted) {
          pill.style.border = "1px solid #0066cc";
      }
      const boldBorderSkills = ["Language Proficiency", "Roles", "Personal Attributes"];
      if (boldBorderSkills.includes(skill.name)) {
        pill.style.borderWidth = "2.5px";
        pill.style.borderColor = "#009688";
      }
      const skillName = document.createElement("span");
      skillName.textContent = skill.name;
      if (skill.name.length > 30) {
          skillName.style.display = "inline-block";
          skillName.style.maxWidth = "150px";
          skillName.style.whiteSpace = "nowrap";
          skillName.style.overflow = "hidden";
          skillName.style.textOverflow = "ellipsis";
          manageTooltip(skillName, skill.name);
      }
      pill.appendChild(skillName);
      
      if (skill.child_count > 0) {
          const plusIcon = document.createElement("span");
          plusIcon.textContent = " +";
          plusIcon.style.marginLeft = "5px";
          plusIcon.style.fontWeight = "bold";
          pill.appendChild(plusIcon);
          
          pill.addEventListener("click", (e) => {
              e.stopPropagation();
              fetch(`https://uat-lambdaapi.iysskillstech.com/latest/dev-api/cat-tree/?path_addr=${skill.path_addr}`)
                  .then(res => res.json())
                  .then(treeData => {
                      if (treeData.ancestors.length > 0) {
                          updateBreadcrumbs(treeData.ancestors, skill);
                      } else {
                          updateBreadcrumbs([], skill);
                      }
                      fetchSkillsByPath(skill.path_addr);
                  });
          });
      } else {
          pill.addEventListener("click", () => {
              document.getElementById("plugin-search-id").value = skill.name;
              searchBox.value = skill.name;
              dropdownMenu.style.display = "none";
              adjustCardBodyMargin();
              if (skill.name && skill.name.trim() !== "") {
                  const encodedSearchValue = encodeURIComponent(skill.name.trim());
                  // searchAPI(encodedSearchValue, encodedSearchValue, skill.path_addr);
              }
              $(".hard-skills").trigger("click");
          });
      }
      
      return pill;
    }

    function adjustCardBodyMargin() {
      const cardBodyDiv = document.querySelector(".card-body");
      if (!cardBodyDiv) return;
  
      if (dropdownMenu.style.display === "block") {
          cardBodyDiv.style.marginTop = "17%"; // or any value you prefer
      } else {
          cardBodyDiv.style.marginTop = "0px";
      }
   }

    var hardSkills = createSkillTabButton(
      "hard-skills",
      "#hard-skills-content",
      "fa-wand-magic-sparkles",
      "Search Skills",
      "Knowledge and Skills related to concepts, methods, processes, technologies, tools and such"
    );
    // hardSkills.style.marginRight="14px";
    hardSkills.style.marginLeft = "15px";
    // var softSkills = createSkillTabButton(
    //   "soft-skills",
    //   "#soft-skills-content",
    //   "fa-table",
    //   "SOFT SKILLS",
    //   "Cognitive/Thinking, People skills, Traits and such"
    // );
    // softSkills.style.marginLeft = "15px";
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
    // selectboxButton.style.font = "normal normal 600 16px/46px Segoe UI;";
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
            const response = await fetch("https://uat-lambdaapi.iysskillstech.com/latest/dev-api/listout-soft-skills/");
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
    // skillGroupButton.appendChild(hardSkills);
    // skillGroupButton.appendChild(softskillSelectboxDiv);
    // skillGroupButton.appendChild(role);

    skillGroupNavDiv.appendChild(skillGroupButton);
    // skillGroupNavDiv.appendChild(skillGroupDescription);
    skillGroupDiv.appendChild(skillGroupNavDiv);

    groupSkilltypeDiv.appendChild(skillGroupDiv);

    homeTabDiv.appendChild(groupSkilltypeDiv);

    //First page content image
    var imgBodyDiv = document.createElement("div");
    imgBodyDiv.className = "img-body";
    imgBodyDiv.style.display = "flex";
    imgBodyDiv.style.padding = "20px";
    // imgBodyDiv.style.marginRight = "60px";
    imgBodyDiv.style.alignItems = "center";
    imgBodyDiv.style.justifyContent = "center";
    imgBodyDiv.style.flexDirection = "column";

    var contentImg = document.createElement("img");
    contentImg.src = `${imagePath}Group 175.svg`;
    contentImg.style.maxWidth = "906px";
    contentImg.style.width = "100%";
    contentImg.style.height = "auto";
    // contentImg.style.height = "466px";

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
    // homeTabDiv.appendChild(imgBodyDiv);
    //end the first page content image

    var cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body-search card-body";
    // cardBodyDiv.style.display = "none";

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
          // const item = event.target.closest(".dropdown-item");
          // if (item) {
          //   const skillText = item.querySelector("span:first-child").textContent.trim();
          //   const hasChild = item.querySelector("span:last-child")?.textContent === ">"; // Down arrow means it has children
          //   const skillId = item.getAttribute("data-path-addr");
          //   if (skillText && !hasChild && skillId) {
          //     searchInputBox.value = skillText;
          //     console.log(skillText);
          //     this.searchValue = skillText;
          //     if (this.searchValue && this.searchValue.trim() !== "") {
          //       const encodedSearchValue = encodeURIComponent(this.searchValue.trim());
          //       console.log("entered call category searchapi");
          //       this.searchAPI(encodedSearchValue,encodedSearchValue,skillId);
          //     }
          //     $(".hard-skills").trigger("click");
          //   }
          // }
          const pill = event.target.closest(".skill-pill");
          if (pill) {
            const skillId = pill.getAttribute("data-path-addr");
            const skillName = pill.querySelector("span:first-child").textContent.trim();
            const hasChildren = pill.querySelector("span:last-child")?.textContent === " +";
            
            // If it's a skill with no children (leaf node)
            if (!hasChildren) {
                // searchInputBox.value = skillName;
                console.log(skillName);
                this.searchValue = skillName;
                if (this.searchValue && this.searchValue.trim() !== "") {
                    const encodedSearchValue = encodeURIComponent(this.searchValue.trim());
                    console.log("entered call category searchapi");
                    this.searchAPI(encodedSearchValue, encodedSearchValue, skillId);
                }
                // $(".hard-skills").trigger("click");
                dropdownMenu.style.display = "none";
                adjustCardBodyMargin();
            }
          }
      });

      // $(document).on('click', (event) => {
      //   if (
      //       !$(event.target).closest("#dropdownMenu").length && 
      //       !$(event.target).closest(".dropdown-item").length
      //   ) {
      //       dropdownMenu.style.display = "none";
      //       adjustCardBodyMargin();
      //       searchBox.value = "";
      //   }
      // });
      document.addEventListener("click", (event) => {
        const dropdownMenu = document.getElementById("skills-horizontal-menu");
        const searchBox = document.querySelector(".search-input");
        if (
            !dropdownMenu.contains(event.target) &&
            !searchBox.contains(event.target)
        ) {
            dropdownMenu.style.display = "none";
            searchBox.value = "";
            adjustCardBodyMargin();
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
          // $(".hard-skills").click();
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
    // var skillSelectInformationDiv = document.createElement("div");
    // skillSelectInformationDiv.className = "skillSelectInformation";
    // skillSelectInformationDiv.style = "margin: 20px auto; background: #f4f6f9; padding: 15px; border-radius: 30px; width: 100%; font-family: system-ui; text-align: left; font-size: 16px; background-color: #e8f5e9;";
    // skillSelectInformationDiv.innerHTML = `
    //   <span style="padding-left:5px;">To add a <strong>Skill</strong> to your profile, click
    //     <img src="${imagePath}Group 24.svg" alt="select skill" class="icon" style="width: 30px; height: 30px; margin-left: 10px; margin-right:10px; vertical-align: middle;"/> 
    //     To see <strong>Skills</strong> below, click
    //     <img src="${imagePath}hovercircle.png" alt="children skill" class="icon" style="width: 30px; height: 30px; margin-left: 10px; margin-right:10px; vertical-align: middle;"/>
    //   </span>
    // `;
    var elementCountLabelDiv = document.createElement("div");
    elementCountLabelDiv.className = "elementCountLabel";
    var tabContentDiv2 = document.createElement("div");
    tabContentDiv2.className = "tab-content";
    tabContentDiv2.id = "pills-tabContent";
    var skillPlaygroundDiv = document.createElement("div");
    skillPlaygroundDiv.id = "skillPlayground";
    var replaceholderDiv = document.createElement("div");
    replaceholderDiv.id = "replaceholder";

    tabContentDiv2.appendChild(skillPlaygroundDiv);
    tabContentDiv2.appendChild(replaceholderDiv);

    cardBodyDiv.appendChild(searchDiv);
    // cardBodyDiv.appendChild(skillSelectInformationDiv);
    cardBodyDiv.appendChild(elementCountLabelDiv);
    cardBodyDiv.appendChild(tabContentDiv2);
    homeTabDiv.appendChild(cardBodyDiv);

    // Append home tab pane div to tab content div
    tabContentDiv.appendChild(homeTabDiv);

    // Create profile tab pane div
    var profileTabDiv = document.createElement("div");
    profileTabDiv.className = "tab-pane fade container-fluid profile-tab";
    // profileTabDiv.style = "padding:30px;";
    profileTabDiv.id = "profile0";
    profileTabDiv.setAttribute("role", "tabpanel");
    profileTabDiv.setAttribute("aria-labelledby", "profile-tab0");
    // if (iysplugin.tap == "profile") {
    //   profileTabDiv.classList = "show active";
    //   homeTabDiv.classList = "d-none";
    // }
    if (iysplugin.tap === "profile") {
      profileTabDiv.classList.add("show", "active");
      homeTabDiv.classList.remove("show", "active");
    }

    var containerFluidDiv = document.createElement("div");
    containerFluidDiv.className = "container-fluid custom-container";
    // containerFluidDiv.style =
    //   "background-color:#EFF4FA; padding:30px; border-radius:10px; border:2px solid #EFF4FA;";

    var mb4mt3Div = document.createElement("div");
    mb4mt3Div.className = "mb-4 profile-header";
    var h3Element = document.createElement("p");
    h3Element.className = "h3";
    h3Element.style = "color:#1E1E1E;";
    if (isLoginUser) {
      var firstName = logginUserDetail.first_name;
      function capitalizeFirstLetter(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
      }
      var capitalizedFirstName = capitalizeFirstLetter(firstName);

      var firstNameSpan = document.createElement("span");
      firstNameSpan.style = "font-weight:bold; color:#285192;"; 
      firstNameSpan.textContent = capitalizedFirstName;
  
      h3Element.textContent = "";
      h3Element.appendChild(firstNameSpan);
      h3Element.appendChild(document.createTextNode(" Skills Profile"));
      // --- Add Save Button for logged-in user ---
      var saveSkillsBtn = document.createElement("button");
      saveSkillsBtn.id = "loggin-user-save-btn";
      saveSkillsBtn.textContent = "Save";
      saveSkillsBtn.style = "margin-left:20px; padding:6px 24px; background:#007DFC; color:#fff; border:none; border-radius:6px; font-size:15px; font-weight:500; cursor:pointer; float:right;";
      saveSkillsBtn.onclick = async () => {
          const skills = JSON.parse(localStorage.getItem("logginUserRatedSkills") || "[]");
          const transformSkillList = transformDataFromLocalStorage(
            skills
          );
    
          if (transformSkillList?.skills?.length > 0) {
            console.log("adding some saved slikks ", transformSkillList);
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
                console.log("Skill added successfully!");
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
          }
      };
      h3Element.appendChild(saveSkillsBtn);
    } else {
      h3Element.textContent = "Skills Profile";
    }
    var container = document.createElement("div");
    container.className = "flex-container";
    // container.style.display = "flex";
    // container.style.alignItems = "center";
    // container.style.gap = "10px"; // Optional spacing between elements

    // var pElement = document.createElement("p");
    // pElement.className = "p-0 m-0";
    // pElement.style = "color:#9B9B9B";
    // pElement.textContent = "You have skills added to your profile.";

    // var returnHomeLink = document.createElement("a");
    // returnHomeLink.id = "home-link";
    // returnHomeLink.href = "#";
    // returnHomeLink.textContent = "Click here to select skills profile";
    // returnHomeLink.onclick = openHomeTab;
    // returnHomeLink.style.marginRight = "20px";
    // returnHomeLink.style.fontSize = "16px";
    // returnHomeLink.style.color = "#46419C";
    // returnHomeLink.style.textDecoration = "underline";

    var skillRateInformationDiv = document.createElement("div");
    skillRateInformationDiv.className = "skillRateInformation";
    skillRateInformationDiv.style = "margin: 20px auto; padding: 10px 0px 10px 10px; border-radius: 30px; width: 100%; font-family: system-ui; text-align: left; font-size: 16px;";
    skillRateInformationDiv.style.border = "0.4px solid #E1F7E9";
    skillRateInformationDiv.style.background = "#E1F7E9";
    // skillRateInformationDiv.innerHTML = `
    //   <span style="padding-left:5px;">To add proficiencies in <strong>Skills</strong> click
    //     <i class="fas fa-star" style="font-size: 22px; margin-left:8px; color:#ccccff;"></i>
    //   </span>
    // `;
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
    mb4mt3Div.appendChild(h3Element);
    // container.appendChild(pElement);
    // if (iysplugin.tap != "profile") {
    //   container.appendChild(returnHomeLink);
    // }
    mb4mt3Div.appendChild(container);
    if (iysplugin.tap != "profile" || (iysplugin.tap == "profile" && iysplugin.isEdit && iysplugin.isDelete)) {
      mb4mt3Div.appendChild(skillRateInformationDiv);
    }
    var my3Div = document.createElement("div");
    my3Div.className = "my-3 custom-box d-flex justify-content-center";
    // my3Div.style =
    //   "background-color:#FFFFFF; border-radius:10px; padding:20px;";
    var navPillsDiv = document.createElement("div");
    navPillsDiv.className = "nav nav-pills view-skill-profile m-0";
    navPillsDiv.id = "viewsTab";
    navPillsDiv.style = "display:inline-block;";

    var btnGroupDiv = document.createElement("div");
    // btnGroupDiv.className = "d-flex";
    btnGroupDiv.className = "d-none";
    // btnGroupDiv.setAttribute("role", "group");
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
    // tabContentDiv3.className = "tab-content card p-3";
    tabContentDiv3.id = "viewsTabContent0";
    tabContentDiv3.style = "box-shadow:none;";

    var quickTabContentDiv = document.createElement("div");
    // quickTabContentDiv.className = "tab-pane fade show active";
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
    // tabularTabContentDiv.className = "tab-pane fade";
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

    // tabularTabContentDiv.appendChild(h5TabularView);
    // tabularTabContentDiv.appendChild(pTabularView);
    // tabularTabContentDiv.appendChild(brElement);
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
    // modalDialogDiv.style="max-width:52%;"

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
    // rateSkillCommentBoxLabel.textContent = "Enter Remark (20-100 characters)";

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

    // /dkslgfkdffmg

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
    // kljdsfkgdf

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
    // accordionButton.style.backgroundColor = "#eff5ff";

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
    containerFluidDiv.appendChild(tabContentDiv);

    // Append container fluid div to tab pane div
    tabPaneDiv.appendChild(containerFluidDiv);

    // Append tab pane div to document body
    cardDiv.appendChild(tabPaneDiv);

    // mndnfgmnfnjkghf

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
      // buttonContainer.style.position = "relative";
      var button = document.createElement("button");
      // button.setAttribute("data-mdb-tab-init", "");
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
      // button.setAttribute("data-mdb-target", dataTarget);
      button.type = "button";
      // button.setAttribute("role", "tab");
      // button.setAttribute("aria-controls", "home");
      // button.setAttribute("aria-selected", "true");
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
        console.log("adding some saved slikks ", transformSkillList);
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
            console.log("Skill added successfully!");
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

          // this.createListProfileSkills();
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
    // this.createAreaBox();
    // this.crea
    this.createRateSelectedSkills(this.skillPlayground);
    // this.createListProfileSkills();
    // Automatically search for a job role from localStorage
    const searchSkill = localStorage.getItem("searchSkill");
    if (searchSkill) {
        if (searchSkill && typeof this.searchAPI === "function") {
            this.searchValue = searchSkill;
            this.searchAPI(searchSkill,searchSkill);
        }
    }
  }

  createPlayground() {
    this.selectedASkillBox = document.createElement("div");
    this.selectedASkillBox.classList.add("selected-skill-div");
    this.selectedASkillBox.id = "selected-skill-div";
    this.skillPlayground.appendChild(this.selectedASkillBox);
  }

  skillClick(skillListId,selectedValue) {
    console.log(skillListId);
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
      url = `https://uat-api.myskillsplus.com/api-child/?path_addr=${skillFileId}`;
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

  /**
   * creating accordion **/

  //   createSkillButton(
  //     htmlElement,
  //     skillDetail,
  //     isFuncSkill,
  //     identifier,
  //     uniqueIdentifier
  //   ) {
  //     const userSkillDetail = sortRatingByLocalStorage();
  //     const isParentAvailable = isParentIdAvailable(
  //       userSkillDetail,
  //       skillDetail.path_addr
  //     );
  //     var parentDiv = document.createElement("div");
  //     parentDiv.setAttribute("class", "parent-accordion");
  //     parentDiv.style.border = "1px solid #E6E6E6";
  //     parentDiv.style.borderRadius = "10px";
  //     parentDiv.style.margin = "5px";
  //     parentDiv.style.padding = "6px 12px";
  //     parentDiv.style.backgroundColor = "#F6F7F9";
  //     parentDiv.style.cursor = "pointer";
  //     parentDiv.style.color = "#1E1E1E";
  //     parentDiv.style.fontSize = "16px";
  //     // parentDiv.setAttribute("id", "parent-" + skillDetail.path_addr);

  //     var subDivIdForPlusAndElement = document.createElement("div");
  //     subDivIdForPlusAndElement.style.textAlign = "left";
  //     subDivIdForPlusAndElement.setAttribute("class", "child-accordion");
  //     // subDivIdForPlusAndElement.setAttribute("id", "parent-" + skillDetail.path_addr);

  //     var childDiv = document.createElement("div");
  //     childDiv.setAttribute("id", "child-" + skillDetail.path_addr);
  //     childDiv.style.display = "flex";
  //     childDiv.style.flexWrap = "wrap";

  //     if (isParentAvailable) {
  //       manageModalOnPlusOne(childDiv, isParentAvailable);
  //     }
  //     console.log(
  //       isParentAvailable,
  //       "skillDetail.ratingsskillDeskillDetail.ratingsskillDetail.ratings",
  //       uniqueIdentifier
  //     );

  //     if (identifier === "accordionChild") {
  //       console.log(skillDetail, "skillDetail", identifier);
  //       htmlElement.innerHTML = "";
  //       var skilldetailKey = document.getElementById(uniqueIdentifier);
  //       const foundObject = findObjectByIsotFileId(
  //         userSkillDetail,
  //         skillDetail.path_addr
  //       );

  //       var panelDiv = document.createElement("button");
  //       panelDiv.setAttribute("class", skillDetail.path_addr);
  //       panelDiv.setAttribute("data-name", skillDetail.name);
  //       if (skillDetail.child_count > 0) {
  //         panelDiv.setAttribute("row-data", JSON.stringify(skillDetail));
  //       }

  //       panelDiv.style.border = "1px solid #E6E6E6";
  //       panelDiv.style.borderRadius = "10px";
  //       panelDiv.style.margin = "5px";
  //       panelDiv.style.padding = "6px 12px";
  //       panelDiv.style.background = "#F6F7F9";
  //       panelDiv.style.cursor = "pointer";
  //       panelDiv.style.color = "#1E1E1E";
  //       panelDiv.style.fontSize = "16px";

  //       panelDiv.addEventListener("mouseover", function () {
  //         // Add a 1px border when the mouse is over the element
  //         panelDiv.style.border = "1px solid #4F4F4F";
  //       });

  //       panelDiv.addEventListener("mouseout", function () {
  //         // Remove the border when the mouse is no longer over the element
  //         panelDiv.style.border = "1px solid #E6E6E6";
  //       });

  //       var infoDesBtn = document.createElement("i");

  //       if (foundObject) {
  //         console.log("if working");
  //         panelDiv.style.border = "0.4px solid #21965333";
  //         panelDiv.setAttribute(
  //           "class",
  //           `${skillDetail.path_addr} selected-skills`
  //         );
  //         const wordCounting = wordCount(skillDetail.name);
  //         if (wordCounting > 2) {
  //           panelDiv.innerHTML = `<i class="fa fa-check"></i> ${skillDetail.name} `;
  //         } else {
  //           panelDiv.innerHTML = `<i class="fa fa-check"></i> ${skillDetail.name}`;
  //         }

  //         infoDesBtn.setAttribute("class", "infoSelectedSkill");
  //         infoDesBtn.innerHTML =
  //           ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#007DFC" class="bi bi-info-circle" viewBox="0 0 16 16" style="margin: -4px 10px 0 0;" > <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
  //         infoDesBtn.style.cursor = "pointer";
  //         if (skillDetail) {
  //           manageTooltip(
  //             infoDesBtn,
  //             `<div>
  //           ${
  //             skillDetail.description !== null
  //               ? `<p>${skillDetail.description}</p>`
  //               : ""
  //           }
  //         </div>`
  //           );
  //         }
  //       } else {
  //         // <span style="border-radius: 50%;width: 5px;height: 5px;margin-bottom: 3px;background-color: #828282;display: inline-block;"></span>
  //         // <span style="color:#828282">${skillDetail.child_count} sub categories </span>
  //         console.log("else working");
  //         const wordCounting = wordCount(skillDetail.name);
  //         if (skillDetail.child_count > 0) {
  //           panelDiv.innerHTML = `<div style="position: relative; text-align: left;">
  //           <span style="margin-right: 13px;">${skillDetail.name}</span>
  //           <div style="left: 50%; transform: translateX(-50%); display:inline-block;" title="${skillDetail.child_count} sub categories" >
  //               <span style="height:7px; width:7px; display:inline-block; position:absolute; margin-top:2px; border:2px solid #024FAB;"></span>
  //               <span style="height:7px; width:7px; display:inline-block; position:relative; border:2px solid #024FAB;"></span>
  //               <span style="height:7px; width:7px; display:inline-block; position:absolute; margin-top:2px; border:2px solid #024FAB;"></span>
  //               <span style="height:7px; width:7px; display:inline-block; position:relative; border:2px solid #024FAB;"></span>
  //           </div>
  //         </div>`;

  //           panelDiv.id = `haveChild-${skillDetail.path_addr}`;
  //         } else if (wordCounting > 2) {
  //           panelDiv.innerHTML = skillDetail.name;
  //         } else {
  //           panelDiv.innerHTML = `${skillDetail.name}`;
  //         }
  //       }

  //       const getidparent = document.getElementById("accordion-parent");

  //       if (getidparent) {
  //         getidparent.addEventListener("click", () => {
  //           skilldetailKey.innerHTML = "";
  //           this.childrenSkillAPI(uniqueIdentifier, "accordionChild");
  //         });
  //       }
  //       panelDiv.addEventListener("click", () => {
  //         const buttonId = panelDiv?.id;
  //         const buttonClass = panelDiv?.className;
  //         if (buttonId) {
  //           console.log(buttonId, "rerere");
  //           skilldetailKey.innerHTML = "";
  //           const subChildBreadcrumbs = document.createElement("div");
  //           subChildBreadcrumbs.style.width = "100%";
  //           subChildBreadcrumbs.style.textAlign = "left";
  //           // subChildBreadcrumbs.style.border="2px solid #F1F1F1";
  //           // subChildBreadcrumbs.style.borderRadius="5px";
  //           subChildBreadcrumbs.style.padding="6px";
  //           subChildBreadcrumbs.style.marginBottom = "10px";
  //           const subParentChildBreadcrumbsSpan = document.createElement("span");
  //           subParentChildBreadcrumbsSpan.style.color="#A7A4DC";
  //           subParentChildBreadcrumbsSpan.style.fontSize="16px";
  //           subParentChildBreadcrumbsSpan.id = "accordion-parent";
  //           subParentChildBreadcrumbsSpan.style.paddingRight = "5px";
  //           subParentChildBreadcrumbsSpan.setAttribute("class", "cursor-pointer");
  //           subParentChildBreadcrumbsSpan.textContent = `${skilldetailKey.getAttribute(
  //             "data-name"
  //           )} `;

  //           const hirarchyArrowIcon = document.createElement("span");
  //           const svgContent = `
  //               <svg xmlns="http://www.w3.org/2000/svg" width="9.994" height="15" viewBox="0 0 9.994 15">
  //               <g id="Group_18" data-name="Group 18" transform="translate(434.972 -59.753)">
  //                 <path id="Path_28" data-name="Path 28" d="M-428.185,67.249l-1.179-.983q-2.584-2.154-5.167-4.308a1.234,1.234,0,0,1-.17-1.716,1.215,1.215,0,0,1,1.72-.231c.748.594,1.475,1.215,2.209,1.827q2.645,2.2,5.288,4.409a1.25,1.25,0,0,1-.006,2.016l-7.37,6.145a1.223,1.223,0,0,1-1.412.207,1.19,1.19,0,0,1-.7-1.168,1.173,1.173,0,0,1,.439-.9q3.062-2.555,6.128-5.106C-428.335,67.383-428.269,67.323-428.185,67.249Z" transform="translate(0)" fill="#e0deff"/>
  //               </g>
  //             </svg>
  //           `;
  //           hirarchyArrowIcon.innerHTML = svgContent;
  //           hirarchyArrowIcon.style.marginRight = "5px";
  //           const hirarchyLevelSpan = document.createElement("span");
  //           hirarchyLevelSpan.innerHTML = ` ${panelDiv.getAttribute(
  //             "data-name"
  //           )} `;
  //           hirarchyLevelSpan.className = "hirarchyLevel cursor-pointer";
  //           hirarchyLevelSpan.style.fontSize = "16  px";
  //           hirarchyLevelSpan.style.color = "#4F46FB";
  //           hirarchyLevelSpan.setAttribute("get-that-id", buttonClass);
  //           hirarchyLevelSpan.setAttribute(
  //             "row-data",
  //             JSON.stringify(skillDetail)
  //           );

  //           // const hirarchyLevelSpanPlusIcon = document.createElement("i");
  //           // hirarchyLevelSpanPlusIcon.className = "fa fa-plus cursor-pointer";
  //           // hirarchyLevelSpanPlusIcon.style.color = "#007DFC";

  //           const hirarchyRateButton=document.createElement("button")
  //           hirarchyRateButton.className="hirarchyrate";
  //           hirarchyRateButton.style.backgroundColor = "#E0DEFF";
  //           hirarchyRateButton.style.paddingTop = "1px";
  //           hirarchyRateButton.style.paddingBottom = "1px";
  //           hirarchyRateButton.style.border = "none";
  //           hirarchyRateButton.style.borderRadius = "5px";
  //           hirarchyRateButton.setAttribute(
  //             "row-data",
  //             JSON.stringify(skillDetail)
  //           );

  //           const hirarchyRateButtonImg = document.createElement("img")
  //           hirarchyRateButtonImg.src = `${imagePath}Group 11.svg`;
  //           hirarchyRateButtonImg.alt ="Rate icon";
  //           hirarchyRateButtonImg.style.verticalAlign = "middle";
  //           hirarchyRateButtonImg.style.marginRight = "4px";

  //           const hirarchyRateButtonSpan = document.createElement("span");
  //           hirarchyRateButtonSpan.innerHTML = "Rate";
  //           hirarchyRateButtonSpan.style.color="#4F46FB";
  //           hirarchyRateButtonSpan.style.fontSize="16px";

  //           hirarchyRateButton.appendChild(hirarchyRateButtonImg);
  //           hirarchyRateButton.appendChild(hirarchyRateButtonSpan);

  //           hirarchyRateButton.addEventListener("click", () => {
  //             this.changeRateModelElement(skillDetail, uniqueIdentifier);
  //           });

  //           // const subParentChildBreadcrumbsSpanForCount =
  //           //   document.createElement("span");
  //           // subParentChildBreadcrumbsSpanForCount.id = "accordion-parent-count";
  //           // subParentChildBreadcrumbsSpanForCount.textContent = `${skillDetail.child_count} sub categories`;
  //           // subParentChildBreadcrumbsSpanForCount.style.float = "right";
  //           // subParentChildBreadcrumbsSpanForCount.style.fontSize = "14px";
  //           // subParentChildBreadcrumbsSpanForCount.style.color = "#BDBDBD";

  //           subChildBreadcrumbs.appendChild(subParentChildBreadcrumbsSpan);
  //           subChildBreadcrumbs.appendChild(hirarchyArrowIcon);
  //           subChildBreadcrumbs.appendChild(hirarchyLevelSpan);
  //           subChildBreadcrumbs.appendChild(hirarchyRateButton);

  //           // subChildBreadcrumbs.appendChild(
  //           //   subParentChildBreadcrumbsSpanForCount
  //           // );

  //           skilldetailKey.appendChild(subChildBreadcrumbs);
  //           this.childrenSkillAPI(
  //             buttonClass,
  //             "accordionChild",
  //             uniqueIdentifier
  //           );
  //         } else {
  //           console.log("going thsat");
  //           if (skillDetail.ratings && skillDetail.ratings.length > 0) {
  //             this.changeRateModelElement(skillDetail, uniqueIdentifier);
  //           }
  //         }
  //       });
  //       skillDetail.description !== null ? panelDiv.appendChild(infoDesBtn) : "";
  //       skilldetailKey.appendChild(panelDiv);
  //       var hirarchyLevelSpan = document.getElementsByClassName("hirarchyrate");
  //       if (hirarchyLevelSpan) {
  //         for (const element of hirarchyLevelSpan) {
  //           const selectedHirarchyRating = JSON.parse(
  //             element.getAttribute("row-data")
  //           );

  //           element.addEventListener("mouseover", function () {
  //             element.style.color = "#007DFC";
  //           });

  //           element.addEventListener("mouseout", function () {
  //             element.style.color = "#4F46FB";
  //           });
  //           console.log(
  //             isParentAvailable,
  //             "skillDetail.ratingsskillDeskillDetail.ratingsskillDetail.ratings",
  //             uniqueIdentifier
  //           );
  //           element.addEventListener("click", () => {
  //             if (selectedHirarchyRating) {
  //               this.changeRateModelElement(
  //                 selectedHirarchyRating,
  //                 uniqueIdentifier
  //               );
  //             }
  //           });
  //         }
  //       }
  //     } else {
  //       var subElementSpan = document.createElement("span");
  //       subElementSpan.setAttribute(
  //         "class",
  //         "accordion accordion-false cursor-pointer"
  //       );
  //       subElementSpan.setAttribute("id", "parent-" + skillDetail.path_addr);
  //       subElementSpan.style.width = "calc(100% - 150px)";
  //       subElementSpan.style.textAlign = "left";
  //       subElementSpan.style.fontSize = "18px";
  //     //   subElementSpan.style.font="normal normal Segoe UI;"
  //       subElementSpan.style.color = "#636363";

  //       if (isFuncSkill) {
  //         subElementSpan.innerHTML = `<span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:2px; border:2.3px solid #636363; margin-right: 8px; vertical-align: middle;"><i class="fas fa-plus mr-1"  style="color:#636363; font-size:12px;"></i></span>`;
  //       } else if (skillDetail.child_count > 0) {
  //         subElementSpan.innerHTML = `<span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:2px; border:2.3px solid #636363; margin-right: 8px; vertical-align: middle;"><i class="fas fa-plus mr-1"  style="color:#636363; font-size:12px;" ></i></span>${skillDetail.name}`;
  //       } else {
  //         subElementSpan.textContent = skillDetail.name;
  //       }

  //       subElementSpan.addEventListener("click", async (event) => {
  //         if (isFuncSkill) {
  //           console.log("if function");
  //           // clearsessionStorage();
  //           addTosessionStorage(skillDetail);

  //           this.funcSkillCard.classList.remove("active");
  //           this.softSkillCard.classList.remove("active");
  //           this.experienceProfileCard.classList.remove("active");
  //           this.createSkillSelectBox(skillDetail);
  //         } else if (skillDetail.child_count > 0) {
  //           addTosessionStorage(skillDetail);

  //           const isExpanded =
  //             subElementSpan.getAttribute("class") ===
  //             "accordion accordion-false cursor-pointer";

  //           if (isExpanded) {
  //             this.childrenSkillAPI(skillDetail.path_addr, "accordionChild");
  //             const allAccordionTrueElements = document.querySelectorAll(
  //               ".accordion.accordion-true.cursor-pointer"
  //             );
  //             if (allAccordionTrueElements) {
  //               const removeThatPanelData = document.querySelectorAll(".panel");
  //               allAccordionTrueElements.forEach((element) => {
  //                 element.classList.remove(
  //                   "accordion",
  //                   "accordion-true",
  //                   "cursor-pointer"
  //                 );
  //                 element.classList.add(
  //                   "accordion",
  //                   "accordion-false",
  //                   "cursor-pointer"
  //                 );
  //                 removeThatPanelData.forEach((element) => {
  //                   if (element.id !== skillDetail.path_addr) {
  //                     element.innerHTML = "";
  //                   }
  //                 });

  //                 const iconElement = element.querySelector("i"); // Assuming the <i> tag is directly inside the element
  //                 if (iconElement) {
  //                   iconElement.classList.remove("fa-minus");
  //                   iconElement.classList.add("fa-plus");
  //                 }
  //               });
  //             }
  //             subElementSpan.classList.remove(
  //               "accordion",
  //               "accordion-false",
  //               "cursor-pointer"
  //             );
  //             subElementSpan.classList.add(
  //               "accordion",
  //               "accordion-true",
  //               "cursor-pointer"
  //             );
  //           } else {
  //             document.getElementById(skillDetail.path_addr).innerHTML = "";
  //             subElementSpan.classList.remove(
  //               "accordion",
  //               "accordion-true",
  //               "cursor-pointer"
  //             );
  //             subElementSpan.classList.add(
  //               "accordion",
  //               "accordion-false",
  //               "cursor-pointer"
  //             );
  //           }

  //           //this.createSkillSelectBox(skillDetail,"accordionChild");

  //           const returnAccordionIcon =
  //             subElementSpan &&
  //             subElementSpan.classList.contains("accordion-true")
  //               ? "fas fa-minus"
  //               : "fas fa-plus";

  //           if (isFuncSkill) {
  //             console.log("1");
  //             subElementSpan.innerHTML = `<span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:2px; border:2.3px solid #636363; margin-right: 8px; vertical-align: middle;"><i class="${returnAccordionIcon} mr-1" style="color:#636363; font-size:12px;" ></i></span>`;
  //           } else if (skillDetail.child_count > 0) {
  //             console.log("2");
  //             subElementSpan.innerHTML = `<span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:2px; border:2.3px solid #636363; margin-right: 8px; vertical-align: middle;"><i class="${returnAccordionIcon} mr-1" style="color:#636363; font-size:12px;" ></i></span>${skillDetail.name}`;
  //           } else {
  //             subElementSpan.textContent = skillDetail.name;
  //           }

  //           if (isLoginUser) {
  //             await getListFromLoggedInUser("notLoadded");
  //           }
  //         } else {
  //           this.changeRateModelElement(skillDetail);
  //         }
  //       });

  //       subElementSpan.setAttribute("data-mdb-toggle", "popover");
  //       subElementSpan.setAttribute("data-mdb-content", "its mdb content");
  //       subElementSpan.setAttribute("data-mdb-trigger", "hover");

  //       if (skillDetail.description) {
  //         subElementSpan.addEventListener("mouseover", function () {
  //           const popover = new mdb.Popover(subElementSpan, {
  //             container: "body",
  //             placement: "top",
  //             content: skillDetail.description,
  //             trigger: "hover",
  //           });

  //           popover.show();

  //           setTimeout(() => {
  //             popover.hide();
  //           }, 700);
  //         });
  //       }

  //     //   parentDiv.style.color = "#333333";
  //     //   parentDiv.style.background =
  //     //     isFuncSkill || skillDetail.child_count > 0
  //     //       ? "white"
  //     //       : "white";
  //     //   parentDiv.style.borderRadius = "4px 4px 0px 0px";
  //     //   parentDiv.style.borderBottom = "2px #F1F1F1";
  //     //   parentDiv.style.paddingTop = "10px";
  //     //   parentDiv.style.paddingBottom = "10px";
  //     //   parentDiv.style.borderBottom = "2px solid #F1F1F1";
  //     //   parentDiv.style.fontSize = "105%";

  //       parentDiv.appendChild(subElementSpan);
  //       parentDiv.appendChild(childDiv);
  //       childDiv.appendChild(subDivIdForPlusAndElement);
  //       htmlElement.appendChild(parentDiv);

  //       var skillDetailChild = document.createElement("div");
  //       skillDetailChild.style.padding = "10px";
  //       skillDetailChild.classList.add("panel");
  //       // skillDetailChild.style.justifyContent = "space-around";
  //       skillDetailChild.style.display = "flex";
  //       skillDetailChild.style.flexWrap = "wrap";
  //       skillDetailChild.setAttribute("id", skillDetail.path_addr);
  //       skillDetailChild.setAttribute("data-name", skillDetail.name);

  //       parentDiv.after(skillDetailChild);
  //     }
  //   }

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
        console.log("zeroskill-data", skill);
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

  //################################################################    save skill rating details        #################################################################
  // saveTheSkillComment(
  //   commentValue,
  //   ratingValue,
  //   skillDetail,
  //   parentSkillDetailId
  // ) {
  //   console.log("saveprocess entered");
  //   const userDetails = JSON.parse(localStorage.getItem("loginUserDetail"));
  //   const userId = userDetails?.id;
  //   let userRatedSkill = {
  //     userId,
  //     skills: [
  //       {
  //         path_addr: skillDetail?.path_addr,
  //         ratings: ratingValue,
  //       },
  //     ],
  //   };

  //   const myrate = () => {
  //     if (parentSkillDetailId === undefined) {
  //       var ratedButton = document.getElementById("rateBtn");
  //       ratedButton.style.backgroundColor = "#21965333";
  //       ratedButton.textContent = "rated";
  //       ratedButton.innerHTML += `<i class="fas fa-star"></i>`;
  //       ratedButton.style.color = "black";
  //       ratedButton.style.fontWeight = "normal";
  //     }
  //   };

  //   if (isLoginUser) {
  //     // const saveButtonElement = document.getElementById("saveChangesButton");
  //     // Check if the element exists
  //     // console.log(saveButtonElement, "saveButtonElement");
  //     // if (saveButtonElement) {
  //       // const previousContent = saveButtonElement.innerHTML;
  //       // Create and append the loader
  //       const loader = document.createElement("div");

  //       loader.className = "loader rate";
  //       loader.style.width = "20px";
  //       loader.style.height = "20px";
  //       // saveButtonElement.textContent = "";
  //       // saveButtonElement.appendChild(loader);
  //       fetch(loggedInUserAddSkill, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${getAccessToken.access}`,
  //         },
  //         body: JSON.stringify(userRatedSkill),
  //       })
  //         .then(async (response) => {
  //           if (response.ok) {
  //             // Successful response
  //             // toastr.success(
  //             //   `${skillDetail.name}  added to your profile`
  //             // );
  //             await getListFromLoggedInUser("notLoadded");
  //             this.updateProfileData();
  //             createSelectedSkillsCount();
  //             const buttonName = `${skillDetail.path_addr}button`;
  //             const divName = `${skillDetail.path_addr}div`;
  //             const skillButton = document.getElementById(buttonName);
  //             const buttonContentDiv = document.getElementById(divName);

  //             // Remove existing star icon if any
  //             const existingStarIcon = buttonContentDiv.querySelector(
  //               'img[src*="Group 24.svg"], img[src*="Group 25.svg"], i.fas.fa-star'
  //             );
  //             if (existingStarIcon) {
  //               buttonContentDiv.removeChild(existingStarIcon);
  //             }
  //             // Add new star icon
  //             const starIcon = document.createElement("img");
  //             starIcon.src = `${imagePath}Group 25.svg`;
  //             starIcon.style.marginLeft = "5px";
  //             starIcon.style.cursor = "pointer";
  //             starIcon.addEventListener("click", (event) => {
  //               event.stopPropagation();
  //               // this.showPopup(event,skillDetail);
  //               this.saveTheSkillComment("", "", skillDetail, "");
  //             });

  //             // skillButton.style.backgroundColor = "#E0DEFF";
  //             skillButton.classList.add('rated-skill');
  //             buttonContentDiv.appendChild(starIcon);
  //             displaySelctedSkills();
  //             // myrate();
  //             // if (skillDetail?.path_addr) {
  //             //   const elements = document.getElementsByClassName(
  //             //     skillDetail?.path_addr
  //             //   );
  //             //   console.log(elements, "ratedBtn");
  //             //   for (const element of elements) {
  //             //     element.innerHTML = `<i class="fa fa-check"></i> ${skillDetail?.name}`;
  //             //     element.classList.add(
  //             //       skillDetail?.path_addr,
  //             //       "selected-skills"
  //             //     );
  //             //   }
  //             // }
  //             // saveButtonElement.removeChild(loader);
  //             // saveButtonElement.innerHTML = previousContent;
  //             // this.ratedSkillEvent(skillDetail);
  //           } else {
  //             // Handle errors
  //             toastr.success(`Remove Skill ${skillDetail.name} from profile`);

  //             // saveButtonElement.removeChild(loader);
  //             // saveButtonElement.innerHTML = previousContent;
  //             this.updateProfileData();
  //           }
  //         })
  //         .catch((error) => {
  //           // if (loader && saveButtonElement) {
  //             // saveButtonElement.removeChild(loader);
  //             // saveButtonElement.innerHTML = previousContent;
  //             this.updateProfileData();
  //           // }
  //           // Handle network errors
  //           console.error("Error:", error);
  //         });
  //     // }
  //   } else {
  //     console.log("creating parent for you", parentSkillDetailId);

  //     let url = "";
  //     if (parentSkillDetailId) {
  //       url = `${ENDPOINT_URL}details/?path_addrs=${skillDetail?.path_addr}&path_addrs=${parentSkillDetailId}`;
  //     } else {
  //       url = `${ENDPOINT_URL}details/?path_addrs=${skillDetail?.path_addr}`;
  //     }

  //     fetchData(url, "GET")
  //       .then((response) => {
  //         if (parentSkillDetailId) {
  //           console.log("creating parent for you", parentSkillDetailId);
  //           addTolocalStorage({
  //             comment: commentValue,
  //             rating: ratingValue,
  //             isot_file_id: skillDetail?.path_addr,
  //             isot_file: response[0],
  //             parentSkillDetailId: parentSkillDetailId,
  //             parentSkillDetail: response[1],
  //           });
  //         } else {
  //           addTolocalStorage({
  //             comment: commentValue,
  //             rating: ratingValue,
  //             isot_file_id: skillDetail?.path_addr,
  //             isot_file: response[0],
  //             parentSkillDetailId: parentSkillDetailId,
  //             parentSkillDetail: null,
  //           });
  //         }

  //         // toastr.success(`${skillDetail.name}  added to your profile`);
  //         this.updateProfileData();
  //         createSelectedSkillsCount();
  //         // myrate();
  //         const buttonName = `${skillDetail.path_addr}button`;
  //         const divName = `${skillDetail.path_addr}div`;
  //         const skillButton = document.getElementById(buttonName);
  //         const buttonContentDiv = document.getElementById(divName);

  //         // Remove existing star icon if any
  //         const existingStarIcon = buttonContentDiv.querySelector(
  //           'img[src*="Group 24.svg"], img[src*="Group 25.svg"], i.fas.fa-star'
  //         );
  //         if (existingStarIcon) {
  //           buttonContentDiv.removeChild(existingStarIcon);
  //         }
  //         // Add new star icon
  //         const starIcon = document.createElement("img");
  //         starIcon.src = `${imagePath}Group 25.svg`;
  //         starIcon.style.marginLeft = "5px";
  //         starIcon.style.cursor = "pointer";
  //         starIcon.addEventListener("click", (event) => {
  //           event.stopPropagation();
  //           // this.showPopup(event,skillDetail);
  //           this.saveTheSkillComment("", "", skillDetail, "");
  //         });

  //         // skillButton.style.backgroundColor = "#E0DEFF";
  //         skillButton.classList.add('rated-skill');
  //         buttonContentDiv.appendChild(starIcon);
  //         displaySelctedSkills();
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //       });
  //   }
  // }
  saveTheSkillComment(
    commentValue,
    ratingValue,
    skillDetail,
    parentSkillDetailId
  ) {
    console.log("saveprocess entered");
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
          console.log("creating parent for you", parentSkillDetailId);
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
        // myrate();
        const buttonName = `${skillDetail.path_addr}button`;
        const divName = `${skillDetail.path_addr}div`;
        const skillButton = document.getElementById(buttonName);
        const buttonContentDiv = document.getElementById(divName);

        // Remove existing star icon if any
        const existingStarIcon = buttonContentDiv.querySelector(
          'img[src*="Group 24.svg"], img[src*="Group 25.svg"], i.fas.fa-star'
        );
        if (existingStarIcon) {
          buttonContentDiv.removeChild(existingStarIcon);
        }
        // Add new star icon
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 25.svg`;
        starIcon.style.marginLeft = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          // this.showPopup(event,skillDetail);
          this.saveTheSkillComment("", "", skillDetail, "");
        });

        // skillButton.style.backgroundColor = "#E0DEFF";
        skillButton.classList.add('rated-skill');
        buttonContentDiv.appendChild(starIcon);
        displaySelctedSkills();
      })
      .catch((err) => {
        console.error(err);
      });
  }
  //#####################   create a html rating model box   ############s###########
  changeRateModelElement(skillDetail, parentSkillDetailId) {
    console.log(skillDetail, "skillDetail");
    console.log(parentSkillDetailId, "parentSkillDetailId");
    const RateSkillModel = document.getElementById("RateSkillModel");
    const RateSkillModelLabel = document.getElementById("RateSkillModelLabel");
    const spanElementForStar = document.getElementById("spanElementForStar");
    console.log(spanElementForStar);
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
    console.log("skillDetail", skillDetail);

    let objExist = checkElementExist(skillDetail);

    console.log("objExist", objExist);
    // const modalContent = RateSkillModel.querySelector(".modal-content");
    // if (modalContent) {
    //   modalContent.style.padding = "20px"; // Adjust the border style as needed
    // }
    // const modalHeader = RateSkillModel.querySelector(".modal-header");
    // if (modalHeader) {
    //   modalHeader.style.borderBottom = "1px solid #ccc"; // Adjust the border style as needed
    // }
    if (objExist && Array.isArray(objExist.rating) && objExist.rating.length > 0) {
      rateSkillCommentBox.value = objExist.rating[0].comment ?? "";
    } else {
      rateSkillCommentBox.value = "";
    }
    // if (objExist) {
    //   rateSkillCommentBox.value = objExist.rating[0].comment;
    // } else {
    //   rateSkillCommentBox.value = "";
    // }
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
    // const searchText = searchByName(skill.name);
    // if (searchText.length > 0) {
    // }
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
                console.log(existingRating);
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

  processRelatedSkills(
    htmlElement,
    skillList,
    identifier,
    skillId,
    isInitialLoad = true
  ) {
    console.log("relatedskillId", skillId);
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
              console.log("get-recommendations", response);

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
        CardBody.style.padding = "12px 12px";
        CardBody.classList.add("card-body-accordion");
        // CardBody.style.display = "flex";
        // CardBody.style.flexWrap = "wrap";
        CardBody.style.borderRadius = "10px";
        CardBody.style.margin = "10px 0px";
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
    console.log("HardskillId", skillId);
    console.log("skillList", skillName);
    console.log(skillList);

    // Filter the skillList to handle "Related Skills"
    const updatedSkillList = [];
    for (const skill of skillList) {
      if (skill.name === "Related Skills") {
        const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        try {
          const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
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
      console.log(updatedSkillList);
      CardBody.style.backgroundColor = "white";
      CardBody.style.padding = "12px 12px";
      CardBody.classList.add("card-body-accordion", "skill-accordion");
      CardBody.style.borderRadius = "10px";
      CardBody.style.margin = "10px 0px";
      CardBody.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

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

  // async createSelectSkillsChildBox(
  //   skillName,
  //   htmlElement,
  //   skillList,
  //   identifier,
  //   skillId,
  //   breadcrumbPath = [],
  //   isInitialLoad = true,
  //   highlightSkill,
  //   clickedSkillParentName,
  //   clickedSkillParentId
  // ) {
  //   console.log("HardskillId", skillId);
  //   console.log("skillList", skillName);
  //   console.log(skillList);

  //   // Filter the skillList to handle "Related Skills"
  //   const updatedSkillList = [];
  //   for (const skill of skillList) {
  //     if (skill.name === "Related Skills") {
  //       const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${clickedSkillParentId}`;
  //       try {
  //         const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
  //         if (relatedSkills.length > 0) {
  //           skill.child_count = relatedSkills.length;
  //           updatedSkillList.push(skill);
  //         }
  //       } catch (error) {
  //         console.error(`Error fetching related skills for ${skill.name}:`, error);
  //       }
  //     } else {
  //       updatedSkillList.push(skill);
  //     }
  //   }

  //   const CardBody = document.createElement("div");

  //   const cardBodyInnerDiv = document.createElement("div");
  //   cardBodyInnerDiv.style.backgroundColor = "white";
  //   cardBodyInnerDiv.classList.add("card-body-child-accordion");
  //   cardBodyInnerDiv.style.borderRadius = "10px";
  //   cardBodyInnerDiv.style.marginBottom = "15px";

  //   if (updatedSkillList.length > 0) {
  //     CardBody.style.backgroundColor = "white";
  //     CardBody.style.padding = "30px";
  //     CardBody.classList.add("card-body-accordion");
  //     CardBody.style.borderRadius = "10px";
  //     CardBody.style.marginBottom = "15px";
  //     CardBody.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

  //     const skillsContainer = document.createElement("div");
  //     skillsContainer.classList.add("softskillparentaccordian");
  //     skillsContainer.setAttribute("id", "softskillparentaccordian");
  //     skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
  //     skillsContainer.style.textAlign = "left";

  //     updatedSkillList.sort(
  //       (a, b) =>
  //         (a.display_order !== null ? a.display_order : Infinity) -
  //         (b.display_order !== null ? b.display_order : Infinity)
  //     );

  //     updatedSkillList.forEach((skill) => {
  //       const skillButton = document.createElement("button");
  //       skillButton.className = "softskillbutton";
  //       skillButton.style.border = "2px solid #16a085";
  //       skillButton.style.borderRadius = "10px";
  //       skillButton.style.margin = "5px";
  //       skillButton.style.padding = "6px 12px";
  //       skillButton.style.background = "#FFFFFF";
  //       skillButton.style.cursor = "pointer";
  //       skillButton.style.color = "#4f4f4f";
  //       skillButton.style.fontWeight = "500";
  //       skillButton.style.fontSize = "16px";
  //       skillButton.setAttribute("data-mdb-tooltip-init", "");

  //       const childCount = skill.child_count || 0;
  //       const ratingsCount = skill.ratings ? skill.ratings.length : 0;
  //       const description = skill.description;

  //       const buttonContentDiv = document.createElement("div");
  //       buttonContentDiv.style =
  //         "display:flex; align-items:center; justify-content:center;";

  //       const skillNameSpan = document.createElement("span");
  //       skillNameSpan.textContent = skill.name;
  //       if (skill.name.length > 30) {
  //         skillNameSpan.classList.add("truncate");
  //         if(skill.proxy_skill){
  //           manageTooltip(skillNameSpan, skill.proxy_skill.name);
  //         }
  //         else{
  //           manageTooltip(skillNameSpan, skill.name);
  //         }
  //       }else if (skill.proxy_skill){
  //         manageTooltip(skillNameSpan, skill.proxy_skill.name);
  //       }

  //       if (description) {
  //         const descriptionImg = document.createElement("img");
  //         descriptionImg.src = `${imagePath}Group 27.svg`;
  //         descriptionImg.alt = "description";
  //         descriptionImg.style.marginRight = "10px";
  //         buttonContentDiv.appendChild(descriptionImg);
  //         manageTooltip(descriptionImg, description);
  //       }

  //       buttonContentDiv.appendChild(skillNameSpan);
  //       if (childCount > 0) {
  //         const hoverCircleImg = document.createElement("img");
  //         hoverCircleImg.className="hovercircle";
  //         hoverCircleImg.src = `${imagePath}hovercircle.png`;
  //         hoverCircleImg.alt = "circle";
  //         hoverCircleImg.style.width = "22px";
  //         hoverCircleImg.style.height = "22px";
  //         const tooltip = `${childCount} sub categories`;
  //         hoverCircleImg.style.marginLeft = "10px";
  //         buttonContentDiv.appendChild(hoverCircleImg);
  //         manageTooltip(hoverCircleImg, tooltip);
  //       }

  //       if (ratingsCount > 0) {
  //         const searchText = searchByName(skill.name,skill.path_addr);
  //         if (searchText.length > 0) {
  //           const starIcon = document.createElement("img");
  //           starIcon.src = `${imagePath}Group 23.svg`;
  //           starIcon.style.marginLeft = "5px";
  //           starIcon.style.cursor = "pointer";
  //           starIcon.addEventListener("click", (event) => {
  //             event.stopPropagation();
  //             this.changeRateModelElement(skill);
  //           });
  //           buttonContentDiv.appendChild(starIcon);
  //           skillButton.classList.add('rated-skill');
  //           // skillButton.style.backgroundColor = "#E0DEFF";
  //         } else {
  //           const starIcon = document.createElement("i");
  //           starIcon.className = "fas fa-star";
  //           starIcon.setAttribute("id", skill.path_addr);
  //           starIcon.style.marginLeft = "5px";
  //           starIcon.style.cursor = "pointer";
  //           starIcon.style.color = "#ccccff";
  //           starIcon.addEventListener("click", (event) => {
  //             event.stopPropagation();
  //             this.changeRateModelElement(skill);
  //           });
  //           buttonContentDiv.appendChild(starIcon);
  //         }
  //       }

  //       skillButton.appendChild(buttonContentDiv);

  //       skillButton.addEventListener("click", async () => {
  //         const allButtons = document.querySelectorAll(".softskillbutton");
  //         allButtons.forEach((btn) => {
  //           btn.classList.remove("active-skill-button");

  //           const hoverCircle = btn.querySelector(".hovercircle");
  //           if (hoverCircle) {
  //               hoverCircle.style.filter = "none"; 
  //           }
  //         });
    

  //         // Add active class to the clicked button
  //         skillButton.classList.add("active-skill-button");
  //         const hoverCircle = skillButton.querySelector(".hovercircle");
  //         if (hoverCircle) {
  //           hoverCircle.style.filter = "brightness(0.7)"; // or remove the filter
  //         }

  //         if (skill.child_count === 0 && skill.ratings.length > 0) {
  //           console.log("zeroskill-data", skill);
  //           this.changeRateModelElement(skill);
  //         } else if (skill.name === "Related Skills") {
  //           const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
  //           const relatedSkills = await this.fetchSkills(
  //             relatedSkillApiEndpoint
  //           );
  //           relatedSkills.forEach((skill) => {
  //             if (skill.child_count === 1 && skill.ratings.length > 0) {
  //               skill.child_count = 0;
  //             }
  //           });
  //           if (relatedSkills.length > 0) {
  //             const validRelatedSkills = relatedSkills.filter(
  //               (relatedSkill) => relatedSkill.child_count !== 1
  //             );
  //             const newBreadcrumbPath = [
  //               ...breadcrumbPath,
  //               {
  //                 name: skill.name,
  //                 path_addr: skill.path_addr,
  //                 ratings: skill.ratings,
  //               },
  //             ];
  //             this.renderHardSkills(
  //               validRelatedSkills,
  //               newBreadcrumbPath,
  //               cardBodyInnerDiv,
  //               skill.path_addr,
  //               [],
  //               skillName,
  //               highlightSkill,
  //               clickedSkillParentName,
  //               clickedSkillParentId
  //             );
  //           }
  //         } else {
  //           if (skill.child_count > 0 && skill.name !== "Related Skills") {
  //             if(skill.ratings.length > 0){
  //               this.changeRateModelElement(skill);
  //             }
  //             const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
  //             const childSkills = await this.fetchSkills(childSkillApiEndpoint);
  //             const validChildSkills = childSkills.filter(
  //               (skill) => skill.name !== "Related Skills"
  //             );
  //             const newBreadcrumbPath = [
  //               ...breadcrumbPath,
  //               {
  //                 name: skill.name,
  //                 path_addr: skill.path_addr,
  //                 ratings: skill.ratings,
  //               },
  //             ];
  //             this.renderHardSkills(
  //               validChildSkills,
  //               newBreadcrumbPath,
  //               cardBodyInnerDiv,
  //               skill.path_addr,
  //               [],
  //               skillName,
  //               highlightSkill,
  //               clickedSkillParentName,
  //               clickedSkillParentId
  //             );
  //           }
  //         }
  //       });

  //       // Automatically click the skill if it matches clickedSkillParentName
  //       if (skill.name === "Related Skills" || skill.name === skillName) {
  //         skillButton.click();
  //       }

  //       skillsContainer.appendChild(skillButton);
  //     });

  //     CardBody.appendChild(skillsContainer);
  //     CardBody.appendChild(cardBodyInnerDiv);
  //   } else {
  //     CardBody.innerHTML = "";
  //   }

  //   htmlElement.appendChild(CardBody);
  // }

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
    console.log("HardskillId", skillId);
    console.log("skillList", skillName);
    console.log(skillList);
    console.log(highlightSkill);
    console.log(clickedSkillParentName);

    // Filter the skillList to handle "Related Skills"
    const updatedSkillList = [];
    for (const skill of skillList) {
      if (skill.name === "Related Skills") {
        const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        try {
          const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
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

    console.log(updatedSkillList);
    const CardBody = document.createElement("div");

    const cardBodyInnerDiv = document.createElement("div");
    cardBodyInnerDiv.style.backgroundColor = "white";
    cardBodyInnerDiv.classList.add("card-body-child-accordion");
    cardBodyInnerDiv.style.borderRadius = "10px";
    cardBodyInnerDiv.style.marginBottom = "10px";

    if (updatedSkillList.length > 0) {
      console.log(updatedSkillList);
      CardBody.style.backgroundColor = "white";
      CardBody.style.padding = "12px 12px";
      CardBody.classList.add("card-body-accordion", "skill-child-accordion");
      CardBody.style.borderRadius = "10px";
      CardBody.style.margin = "10px 0px";
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

        // if (ratingsCount > 0) {
        //   const searchText = searchByName(skill.name,skill.path_addr);
        //   if (searchText.length > 0) {
        //     const starIcon = document.createElement("img");
        //     starIcon.src = `${imagePath}Group 23.svg`;
        //     starIcon.style.marginLeft = "5px";
        //     starIcon.style.cursor = "pointer";
        //     starIcon.addEventListener("click", (event) => {
        //       event.stopPropagation();
        //       this.changeRateModelElement(skill);
        //     });
        //     buttonContentDiv.appendChild(starIcon);
        //     skillButton.classList.add('rated-skill');
        //     // skillButton.style.backgroundColor = "#E0DEFF";
        //   } else {
        //     const starIcon = document.createElement("i");
        //     starIcon.className = "fas fa-star";
        //     starIcon.setAttribute("id", skill.path_addr);
        //     starIcon.style.marginLeft = "5px";
        //     starIcon.style.cursor = "pointer";
        //     starIcon.style.color = "#ccccff";
        //     starIcon.addEventListener("click", (event) => {
        //       event.stopPropagation();
        //       this.changeRateModelElement(skill);
        //     });
        //     buttonContentDiv.appendChild(starIcon);
        //   }
        // }

        if (ratingsCount > 0) {
          const searchText = searchByName(skill.name, skill.path_addr);
          if (searchText.length > 0) {
              const starIcon = document.createElement("img");
              starIcon.src = `${imagePath}Group 25.svg`;
              starIcon.style.marginLeft = "5px";
              starIcon.style.cursor = "pointer";
              starIcon.addEventListener("click", (event) => {
                  event.stopPropagation();
                  // this.showPopup(event, skill); // Call the popup function
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
                  // this.showPopup(event, skill); // Call the popup function
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
            // this.changeRateModelElement(skill);
          } else if (skill.name === "Related Skills") {
            const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
            const relatedSkills = await this.fetchSkills(
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
              // if(skill.ratings.length > 0){
              //   this.changeRateModelElement(skill);
              // }
              const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
              const childSkills = await this.fetchSkills(childSkillApiEndpoint);
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
        // if (skill.name === clickedSkillParentName) {
        //   skillButton.click();
        // }

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
    console.log(skillList);
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
        console.log(skill);
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
    // nav.style.cursor="pointer";
    nav.appendChild(ol);
    nav.addEventListener("click", () => {
      console.log(skills, "skills");
      this.changeRateModelElement(skills);
    });
    htmlElement.appendChild(nav);
  }

  //###############################################################       get Rating model section data   #############################
  createRatingElement(htmlElement, skillDetail, parentSkillDetailId, objExist) {
    console.log(htmlElement);
    // add exception for rating
    try {
      htmlElement.noUiSlider.destroy();
    } catch (error) {
      console.log("error in destroying slider", error);
    }
    console.log(skillDetail);
    if (skillDetail?.ratings.length > 0) {
      let ratingOptions = skillDetail?.ratings;
      var arbitraryValuesForSlider = ratingOptions;
      const modalBodyGet = document.getElementById("spanElementForStar");
      arbitraryValuesForSlider.forEach((sliderObj) => {
        let spanSliderInnerDiv = document.createElement("div");
        spanSliderInnerDiv.className = "slider-container";
        // spanSliderInnerDiv.style= "display:flex";
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

              // if (objExist) {
              //   // check if the rating already exists
              //   objExist.rating.forEach((obj) => {
              //     if (obj.isot_rating_id === sliderObj._id) {
              //       if (obj.rating === index + 1) {
              //         checkboxInput.checked = true;
              //       }
              //     }
              //   });
              // }
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
          console.log("options", options);
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

          console.log("startValue", startValue);
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
          console.log(
            noUiSliderElement,
            "noUiSliderElement",
            spanSliderInnerDiv
          );

          spanSliderInnerDiv.classList.add("slider");
        }
        modalBodyGet.appendChild(htmlElementLabel);
        modalBodyGet.appendChild(spanSliderInnerDiv);

        // if (objExist) {
        //   // check if the rating is already exist
        //   objExist.rating.forEach((obj) => {
        //     if (obj.isot_rating_id === sliderObj._id) {
        //       console.log("silder object", obj, "obj.rating");
        //       spanSliderInnerDiv.set(obj.rating);
        //     }
        //   });
        // }
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
        // event.preventDefault();
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
                console.log("delete the skill", skill);
                iElement.parentElement.remove();
                delete_skill(skill.id);
                console.log("refess the connect");
                // this.createListProfileSkills();
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
          console.log("delted the skill", skill, skill.isot_file_id);
          delete_skill(skill.isot_file_id);
          console.log("refess the connect");
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
    cardDiv.classList.add("card", "create-card");
    const cardBodyDiv = document.createElement("div");
    // cardBodyDiv.style.backgroundColor="#EFF4FA";
    cardBodyDiv.classList.add("card-body", "create-card-body");
    cardBodyDiv.style =
      "padding-left:20px; padding-right:20px; padding-top:5px; padding-bottom:5px; background-color:#EFF4FA; border-radius:5px;";
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
      // descriptionImg.title = description;
      descriptionImg.style.marginRight = "10px";
      descriptionImg.style.width = "18px";
      descriptionImg.style.height = "18px";
      buttonContentDiv.appendChild(descriptionImg);
      manageTooltip(descriptionImg, description);
    }

    buttonContentDiv.appendChild(skillNameSpan);

    if (ratingsCount > 0) {
      const searchText = searchByName(skillDetail.skills[0].name,skillDetail.skills[0].path_addr);
      // if (searchText.length > 0) {
      //   const starIcon = document.createElement("img");
      //   starIcon.src = `${imagePath}Group 23.svg`;
      //   starIcon.style.marginLeft = "5px";
      //   starIcon.style.cursor = "pointer";
      //   starIcon.addEventListener('click', (event) => {
      //       event.stopPropagation();
      //       this.changeRateModelElement(skillDetail.skills[0]);
      //   });
      //   skillButton.style.backgroundColor="#E0DEFF";
      //   buttonContentDiv.appendChild(starIcon);
      // }
      // else{
      if (searchText.length > 0) {
        const starIcon = document.createElement("img");
        starIcon.src = `${imagePath}Group 25.svg`;
        starIcon.style.marginLeft = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          // this.showPopup(event, skillDetail.skills[0]); // Call the popup function
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
          // this.showPopup(event, skillDetail.skills[0]); // Call the popup function
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
    cardBodyDiv.appendChild(cardTitleH4);
    // this.createSkillPath(this.cardBodyDiv, getListFromsessionStorage());
    if (skillDetail?.skills?.length > 0 && !selectedValue) {
      skillDetail.skills.forEach((skill) => {
        // clearsessionStorage();
        this.treeSkillAPI(
          skillDetail.skills[0].name,
          cardBodyDiv,
          skill.path_addr
        );
        // this.createSkillPath(cardBodyDiv, getListFromsessionStorage());
      });
    } else {
      console.log("entered parent skill");
      this.childrenSkillAPI(
        skillDetail.skills[0].name,
        skillDetail.skills[0].path_addr,
        identifier
      );
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
        console.log(response);

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
      console.log(skillsGroup, "skillsGroup");

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
        // skillContainer.style.fontSize = "14px";
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
        // const ratingButton = document.createElement("button");
        // ratingButton.className = "btn btn-rounded shadow-0 random-color-button";
        // if (skill.rating[0].rating) {
        //   ratingButton.innerHTML =
        //     skill.rating[0].rating +
        //     "/" +
        //     skill.isot_file.ratings[0].rating_scale_label.length +
        //     " Rating";
        //   skillContainer.appendChild(ratingButton);
        // } else {
        //   ratingButton.innerHTML = "";
        // }

        const imagePathBase = imagePath;

        // if (percentage === 0) {
        //   const image0 = document.createElement("img");
        //   image0.src = imagePathBase + "0rate.png";
        //   image0.style.width = "30px";
        //   image0.style.height = "30px";
        //   image0.style.margin = "auto";
        //   image0.style.display = "block";
        //   if (iysplugin.doughnt && tagsString != "Certifications") {
        //     skillContainer.appendChild(image0);
        //   }
        // }
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
          console.log("editing things", skill.isot_file);

          this.changeRateModelElement(skill.isot_file);
          // console.log("delete the skill", skill);
          // // delete_skill(skill.id);
          // console.log("refess the connect", skill.index);

          // this.createListProfileSkills();
        });

        deleteIcon.addEventListener("click", () => {
          console.log("delete the skill", skill);
          // delete_skill(skill.id);
          console.log("Deleted skill path_addr", skill.isot_file.path_addr);

          this.deleteSkillsFromLocalStorage(skill.isot_file.path_addr);
          skillContainer.remove();
          createSelectedSkillsCount();
          // this.createListProfileSkills();
        });

        skillsContainer.appendChild(skillContainer);
      });

      section.appendChild(skillsContainer);
      quickViewContentDiv.appendChild(section);
    }
  }

  appendTabularViewContent() {
    const skillsData = getListFromlocalStorage(); // Assuming this function retrieves the skills data

    if (!skillsData || skillsData.length === 0) {
      document.getElementById("tabularViewContentView").innerHTML =
        "No skills data available.";
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
    
    // Append content to tabularViewContentView
    const tabularViewContentDiv = document.getElementById(
      "tabularViewContentView"
    );
    const accordionContainer = document.createElement("div");
    accordionContainer.className = "accordion";
    accordionContainer.style = "border:1px solid rgb(203, 203, 203); border-radius:10px;";
    const accordionIdPrefix = "accordion";

    let accordionIndex = 1;

    for (const tagsString in groupedSkills) {
      const skillsGroup = groupedSkills[tagsString];

      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item";

      const accordionHeader = document.createElement("h2");
      accordionHeader.className = "accordion-header";

      const accordionButton = document.createElement("button");
      accordionButton.setAttribute("data-mdb-collapse-init", true);
      accordionButton.className = "accordion-button";
      accordionButton.type = "button";
      accordionButton.style = "background-color:#F6F7F9;";
      accordionButton.setAttribute("data-mdb-toggle", "collapse");
      accordionButton.setAttribute(
        "data-mdb-target",
        `#${accordionIdPrefix}-collapse-${accordionIndex}`
      );
      accordionButton.setAttribute("aria-expanded", "true");
      accordionButton.setAttribute(
        "aria-controls",
        `${accordionIdPrefix}-collapse-${accordionIndex}`
      );
      // accordionButton.style.backgroundColor = "#eff5ff";

      const headerContent = document.createElement("div");
      headerContent.className = "d-flex gap-3 align-items-center";

      const tagTitle = document.createElement("b");
      tagTitle.innerText = tagsString + " -";
      tagTitle.style = "color:#635BFF;";

      const skillsCount = document.createElement("span");
      skillsCount.innerText = `${skillsGroup.length} elements selected`;
      skillsCount.style = "color:#9B9B9B;";

      // const dot = document.createElement("i");
      // dot.className = "fa fa-xs fa-circle me-1";
      // dot.style.fontSize = "8px";

      headerContent.appendChild(tagTitle);
      // headerContent.appendChild(dot);
      headerContent.appendChild(skillsCount);

      accordionButton.appendChild(headerContent);
      accordionHeader.appendChild(accordionButton);

      const accordionCollapse = document.createElement("div");
      accordionCollapse.id = `${accordionIdPrefix}-collapse-${accordionIndex}`;
      accordionCollapse.className = "accordion-collapse collapse show";
      accordionCollapse.setAttribute(
        "aria-labelledby",
        `${accordionIdPrefix}-heading-${accordionIndex}`
      );

      const accordionBody = document.createElement("div");
      accordionBody.className = "accordion-body";
      accordionBody.style = "padding:0px;";
      skillsGroup.forEach((skill, index) => {
        const skillContainer = document.createElement("div");
        skillContainer.className =
          "taggedSkills d-flex flex-wrap align-items-center justify-content-between gap-3";
        skillContainer.style = "padding:4px 25px; border-bottom:1px solid rgb(203, 203, 203);";
        const ratingboxContainer = document.createElement("div");
        const skillName = document.createElement("div");
        skillName.className = "bg-";
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

        const skillDetails = document.createElement("div");
        skillDetails.className = "d-flex ";
        skillDetails.style.alignItems = "center";
        skillDetails.style.justifyContent = "center";

        const experienceDetails = document.createElement("div");
        experienceDetails.className = "pr-3";
        experienceDetails.style="color:#9B9B9B";
        let ratingValue = 0;
        let ratingLabel = "";
        let showCalendarIcon = false;

        if (skill.rating && skill.rating.length > 0) {
          let ratingIndex = skill.rating.length === 2 ? 1 : 0;
          let ratingScale = skill.isot_file?.ratings?.[ratingIndex]?.rating_scale_label || [];
          let isCertification = skill.isot_file.tags?.some(tag => tag.title === "Certifications");
      
          ratingValue = (skill.rating[ratingIndex]?.rating);
      
          if (isCertification && ratingScale.length === 2) {
              // Certification case: Yes (rating = 1), No (rating = 2)
              ratingLabel = ratingValue === 1 ? ratingScale[0] : "";
          } else if (ratingValue > 0) {
              // Default behavior for other skills
              ratingLabel = ratingScale[ratingValue - 2] || "";
              showCalendarIcon = skill.isot_file?.ratings?.[ratingIndex]?.rating_category === "Experience Level";
          }
        }

        if (ratingLabel) {
          experienceDetails.innerHTML = showCalendarIcon
              ? `<i class="fa fa-lg fa-calendar-days me-1 text-primary"></i> ${ratingLabel}`
              : `${ratingLabel}`;
        } else {
            experienceDetails.style.display = 'none';
        }

        // const ratingDetails = document.createElement("div");
        // ratingDetails.className = "ps-3 border-end border-2  px-2";
        // ratingDetails.innerText = `${skill.rating[0].rating}/${skill.isot_file.ratings[0].rating_scale_label.length} Rating`;
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

        // var percentage;
        // if (skill.rating.length == 2) {
        //   percentage =
        //     ((skill.rating[1].rating - 1) /
        //       skill.isot_file.ratings[1].rating_scale_label.length) *
        //     100;
        // } else {
        //   percentage =
        //     ((skill.rating[0].rating - 1) /
        //       skill.isot_file.ratings[0].rating_scale_label.length) *
        //     100;
        // }

        const imagePathBase = imagePath;

        const ratingDetails = document.createElement("div");
        ratingDetails.className = "px-2";

        // if (percentage === 0) {
        //   const image0 = document.createElement("img");
        //   image0.src = imagePathBase + "0rate.png";
        //   image0.style.width = "40px";
        //   image0.style.height = "40px";
        //   image0.style.margin = "auto";
        //   image0.style.display = "block";
        //   ratingDetails.appendChild(image0);
        // }
        if (percentage === 25) {
          const image25 = document.createElement("img");
          image25.src = imagePathBase + "25.png";
          image25.style.transform = "rotate(270deg)";
          image25.style.width = "34px";
          image25.style.height = "34px";
          image25.style.margin = "auto";
          image25.style.display = "block";
          ratingDetails.appendChild(image25);
        }
        if (percentage === 50) {
          const image50 = document.createElement("img");
          image50.src = imagePathBase + "50.png";
          image50.style.width = "34px";
          image50.style.height = "34px";
          image50.style.margin = "auto";
          image50.style.display = "block";
          ratingDetails.appendChild(image50);
        }
        if (percentage === 75) {
          const image75 = document.createElement("img");
          image75.src = imagePathBase + "75.png";
          image75.style.width = "34px";
          image75.style.height = "34px";
          image75.style.margin = "auto";
          image75.style.display = "block";
          ratingDetails.appendChild(image75);
        }
        if (percentage === 100) {
          const image100 = document.createElement("img");
          image100.src = imagePathBase + "100.png";
          image100.style.width = "34px";
          image100.style.height = "34px";
          image100.style.margin = "auto";
          image100.style.display = "block";
          ratingDetails.appendChild(image100);
        }

        const actionsIconDiv = document.createElement("div");
        actionsIconDiv.className = "actiondiv";
        actionsIconDiv.style ="display:flex; align-items:center;";

        if(percentage <= 0){
          const rateIcon = document.createElement("i");
          rateIcon.className = "fas fa-star";
          rateIcon.style = "font-size: 20px; margin-right:10px";
          rateIcon.setAttribute("data-mdb-tooltip-init", "");
          rateIcon.setAttribute("title", "Click to Rate");
          rateIcon.setAttribute("id", skill.isot_file.path_addr);
          rateIcon.style.color = "#ccccff";
          actionsIconDiv.appendChild(rateIcon);

          rateIcon.addEventListener("click", () => {
            document.querySelectorAll(".rating-box").forEach((box) => {
              box.style.display = "none";
            });
            let ratingBox = this.createRatingBox(skill.isot_file);
            ratingboxContainer.innerHTML = "";
            ratingboxContainer.appendChild(ratingBox);
            ratingBox.style.display = "block";
          });
        }
        else{
          const editIcon = document.createElement("img");
          editIcon.src = `${imagePath}Group 35.svg`;
          editIcon.style = "height:16px; width: 14px; margin-right:10px";
          editIcon.setAttribute("data-mdb-tooltip-init", "");
          editIcon.setAttribute("title", "Click to edit");
          editIcon.setAttribute("id", skill.isot_file.path_addr);
          // editIcon.style.backgroundColor = "#EEEEEE";

          editIcon.addEventListener("click", () => {
            console.log("editing things", skill.isot_file);
            document.querySelectorAll(".rating-box").forEach((box) => {
              box.style.display = "none";
            });
            let ratingBox = this.createRatingBox(skill.isot_file); // Call the function
            ratingboxContainer.innerHTML = "";
            ratingboxContainer.appendChild(ratingBox);
  
            // Toggle visibility
            ratingBox.style.display = "block";
          });

          if (iysplugin.isEdit) {
            actionsIconDiv.appendChild(editIcon);
          }
        }

        const deleteIcon = document.createElement("img");
        deleteIcon.src = `${imagePath}Group 34.svg`;
        deleteIcon.style =
          "height:16px; width: 14px;";
        // deleteIcon.style.backgroundColor = "#EEEEEE";
        deleteIcon.setAttribute("data-mdb-tooltip-init", "");
        deleteIcon.setAttribute("title", "Click to Delete");
        if (iysplugin.isDelete) {
          actionsIconDiv.appendChild(deleteIcon);
        }

        // if (skill.rating[0].rating) {
        //   if (iysplugin.experience && tagsString != "Certifications") {
        //     skillDetails.appendChild(experienceDetails);
        //   }
        //   if (iysplugin.doughnt && tagsString != "Certifications") {
        //     skillDetails.appendChild(ratingDetails);
        //   }
        // }
        if (skill.rating && skill.rating.length > 0 && skill.rating[0]?.rating !== undefined) {
          if (iysplugin.experience) {
              skillDetails.appendChild(experienceDetails);
          }
          if (iysplugin.doughnt) {
              skillDetails.appendChild(ratingDetails);
          }
        }
        skillDetails.appendChild(actionsIconDiv);

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

        skillContainer.appendChild(skillName);
        skillContainer.appendChild(skillDetails);
        skillContainer.appendChild(commentDiv);
        // skillContainer.appendChild(deleteIcon);

        deleteIcon.addEventListener("click", () => {
          console.log("delete the skill", skill);
          // delete_skill(skill.id);
          console.log("Deleted skill path_addr", skill.isot_file.path_addr);

          this.deleteSkillsFromLocalStorage(skill.isot_file.path_addr);
          skillContainer.remove();
          this.updateProfileData();
          createSelectedSkillsCount();

          // this.createListProfileSkills();
        });

        // Check if the skill container is the last child
        // if (index % 2 != 0) {
        //   skillContainer.style.backgroundColor = "#FFFFFF";
        // }

        accordionBody.appendChild(skillContainer);
        accordionBody.appendChild(ratingboxContainer);
      });

      accordionCollapse.appendChild(accordionBody);
      accordionItem.appendChild(accordionHeader);
      accordionItem.appendChild(accordionCollapse);

      accordionContainer.appendChild(accordionItem);
      accordionIndex++;
    }

    // Append the generated content to the tabularViewContentView div
    tabularViewContentDiv.innerHTML = "";
    tabularViewContentDiv.appendChild(accordionContainer);
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

        // this.createSelectSkillsChildBox(this.cardBodyDiv, response);
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

        // this.createSelectSkillsChildBox(this.cardBodyDiv, response);
      })
      .catch((err) => console.error(err));
  }

  // deleteSkillsFromLocalStorage(index) {
  //   if (!isLoginUser) {
  //     let userRatedSkills = JSON.parse(
  //       localStorage.getItem("userRatedSkills", "[]")
  //     );
  //     // delete the skills by index
  //     userRatedSkills.splice(index, 1);
  //     localStorage.setItem("userRatedSkills", JSON.stringify(userRatedSkills));
  //     this.updateProfileData();
  //   } else {
  //     let userRatedSkills = getListFromlocalStorage();
  //     // delete the skills by index
  //     if (localStorage.getItem("logginUserRatedSkills")) {
  //       let removedElement = userRatedSkills.splice(index, 1);
  //       console.log("removedElement", removedElement);

  //       let url = `${deleteSkillApiEndpoint}${removedElement[0].id}/`;
  //       console.warn("url", url);

  //       fetch(url, {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${getAccessToken?.access}`,
  //         },
  //       })
  //         .then((response) => {
  //           if (response.status === 429) {
  //             // Redirect to /limit-exceeded/ page
  //             window.location.href = "/limit-exceeded/";
  //           } else {
  //             return response.json();
  //           }
  //         })
  //         .then(async (response) => {
  //           console.log("response", response);
  //           localStorage.setItem(
  //             "logginUserRatedSkills",
  //             JSON.stringify(userRatedSkills)
  //           );
  //           this.updateProfileData();
  //         });
  //     } else {
  //       userRatedSkills.splice(index, 1);
  //       localStorage.setItem(
  //         "userRatedSkills",
  //         JSON.stringify(userRatedSkills)
  //       );
  //     }
  //     this.updateProfileData();
  //   }
  // }

  deleteSkillsFromLocalStorage(pathAddr) {
    if (!isLoginUser) {
      let userRatedSkills = JSON.parse(
        localStorage.getItem("userRatedSkills", "[]")
      );
      // Find the index of the skill with the matching path_addr
      const skillIndex = userRatedSkills.findIndex(skill => skill.isot_file.path_addr === pathAddr);
      console.log(skillIndex);
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
          console.log("removedElement", removedElement);

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
            console.log("response", response);
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
    console.log(skillId);
    console.log(clickedSkillParentName);
    let pathAddr = clickedSkillParenId && clickedSkillParenId !== "" ? clickedSkillParenId : skillId;
    console.log(pathAddr);
    const skillIdElement = document.getElementById(
      parentIdOfHirarchy !== "" ? parentIdOfHirarchy : skillId
    );
    const selectedSkillDiv = document.querySelector(".card-title");

    const loader = document.createElement("div");
    loader.className = "loader";
    loader.style.margin = "100px auto";

    console.log("skillIdElement", skillIdElement);
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
    console.log(breadcrumbPath);
    if (skillIdElement) {
      // const previousContent = skillIdElement.innerHTML;
      // skillIdElement.appendChild(loader);

      let url = isLoginUser
        ? `https://uat-api.myskillsplus.com/api-child/?path_addr=${pathAddr}`
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
          // skillIdElement.removeChild(loader);
          // skillIdElement.innerHTML = previousContent;

          // const skillsWithTwoTags = response.filter(
          //   (skill) => skill.tags.length === 2
          // );
          // const otherSkills = response.filter(
          //   (skill) => skill.tags.length !== 2
          // );
          const skillsWithTwoTags = response.filter(
            (skill) => 
              skill.tags.some(tag => tag.title === "Skills Category")
          );
          
          const otherSkills = response.filter(
            (skill) => 
              !skill.tags.some(tag => tag.title === "Skills Category")
          );
          console.log(otherSkills);
          console.log(skillsWithTwoTags);

          if (otherSkills.length > 0 || skillsWithTwoTags.length > 0) {
            this.createSelectSkillsChildBox(
              skillName,
              this.cardBodyDiv,
              otherSkills,
              identifier,
              skillId,
              parentBreadcrumbPath,
              "",
              highlightSkill,
              clickedSkillParentName,
              clickedSkillParenId
            );

            if (skillsWithTwoTags.length > 0) {
              this.createCategorySelectSkillsChildBox(
                skillName,
                this.cardBodyDiv,
                skillsWithTwoTags,
                identifier,
                skillId,
                parentBreadcrumbPath,
                "",
                highlightSkill,
                clickedSkillParentName,
                clickedSkillParenId
              );
            }
          }
        })
        .catch((err) => {
          console.error(err);
          skillIdElement.removeChild(loader);
          skillIdElement.innerHTML = previousContent;
        });
    } else {
      // const previousContent = selectedSkillDiv.innerHTML;
      // selectedSkillDiv.appendChild(loader);

      let url = isLoginUser
        ? `https://uat-api.myskillsplus.com/api-child/?path_addr=${pathAddr}`
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
          // selectedSkillDiv.removeChild(loader);
          // selectedSkillDiv.innerHTML = previousContent;

          // const skillsWithTwoTags = response.filter(
          //   (skill) => skill.tags.length === 2
          // );
          // const otherSkills = response.filter(
          //   (skill) => skill.tags.length !== 2
          // );
          const skillsWithTwoTags = response.filter(
            (skill) => 
              skill.tags.some(tag => tag.title === "Skills Category")
          );
          
          const otherSkills = response.filter(
            (skill) => 
              !skill.tags.some(tag => tag.title === "Skills Category")
          );
          console.log(otherSkills);
          console.log(skillsWithTwoTags);

          if (otherSkills.length > 0 || skillsWithTwoTags.length > 0) {
            this.createSelectSkillsChildBox(
              skillName,
              this.cardBodyDiv,
              otherSkills,
              identifier,
              skillId,
              parentBreadcrumbPath,
              "",
              highlightSkill,
              clickedSkillParentName,
              clickedSkillParenId
            );

            if (skillsWithTwoTags.length > 0) {
              this.createCategorySelectSkillsChildBox(
                skillName,
                this.cardBodyDiv,
                skillsWithTwoTags,
                identifier,
                skillId,
                parentBreadcrumbPath,
                "",
                highlightSkill,
                clickedSkillParentName,
                clickedSkillParenId
              );
            }
          }
        })
        .catch((err) => {
          // selectedSkillDiv.removeChild(loader);
          selectedSkillDiv.innerHTML = previousContent;
          console.error(err);
        });
    }
  }

  updateProfileData() {
    // this.appendQuickViewContent();

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
    console.log(skillId);
    let url = "";
    if (isLoginUser) {
      url = `https://uat-api.myskillsplus.com/api-tree/?path_addr=${skillId}`;
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
          // this.createSkillPath(cardBodyDiv, response.ancestors);
          // if (response.siblings.length > 0) {
          //   this.createSelectSkillsChildBox(
          //     this.cardBodyDiv,
          //     response.siblings
          //   );
          // } else {\

          if (response.ancestors.length > 1) {
            let breadcrumbStartIndex = response.ancestors.map(skill => skill.is_discrete).lastIndexOf(1);
            let breadcrumbPath = response.ancestors.slice(breadcrumbStartIndex);
            console.log(breadcrumbPath);
            let lastAncestor = response.ancestors[response.ancestors.length - 1];  // Last ancestor
            let secondLastAncestor = response.ancestors[response.ancestors.length - 2];  // Second last ancestor
            let parentOfLastAncestor = null;  
            if (lastAncestor && lastAncestor.is_discrete === 1) {
                parentOfLastAncestor = "";
            } else {
                parentOfLastAncestor = secondLastAncestor || "";
            }
            console.log(parentOfLastAncestor);
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
            // this.childrenSkillAPI(
            //   `${response.ancestors[1]["name"]} -> ${response.ancestors[0]["name"]}`,
            //   response.ancestors[0]["path_addr"],
            //   "",
            //   "",
            //   skillName
            // );
          } else {
            this.childrenSkillAPI(skillName, skillId);
          }

          // }
          // setTimeout(() => {
          //   document.getElementById(skillId).click();
          // }, 900);
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
          // this.createSkillPath(this.cardBodyDiv, response.ancestors);
          if (response.ancestors.length > 1) {
            let breadcrumbStartIndex = response.ancestors.map(skill => skill.is_discrete).lastIndexOf(1);
            let breadcrumbPath = response.ancestors.slice(breadcrumbStartIndex);
            console.log(breadcrumbPath);
            let lastAncestor = response.ancestors[response.ancestors.length - 1];  // Last ancestor
            let secondLastAncestor = response.ancestors[response.ancestors.length - 2];  // Second last ancestor
            let parentOfLastAncestor = null;  
            // if (lastAncestor && lastAncestor.is_discrete === 1) {
                parentOfLastAncestor = "";
            // } else {
                // if(secondLastAncestor && secondLastAncestor.is_discrete ===1){
                //   parentOfLastAncestor = "";
                // }
                // else{
                  // parentOfLastAncestor = secondLastAncestor || "";
                // }
            // }
            console.log(parentOfLastAncestor);
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
            // this.childrenSkillAPI(
            //   `${response.ancestors[1]["name"]} -> ${response.ancestors[0]["name"]}`,
            //   response.ancestors[0]["path_addr"],
            //   "",
            //   "",
            //   skillName
            // );
          } else {
            this.childrenSkillAPI(skillName, skillId);
          }
          // }
          // setTimeout(() => {
          //   document.getElementById(skillId).click();
          // }, 900);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  // New skills add functionality
  handleHardSkillsClick() {
    console.log("hard-skill clicked");
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
    console.log("role clicked");
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
    console.log("soft-skill clicked");
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

  async fetchSkills(apiEndpoint) {
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
      element.style.color = "#ffffff";
      element.style.fontWeight = "bold";
      element.style.border = "1px solid #16a085";

      if(hoverCircleImg){
        hoverCircleImg.style.filter = 'brightness(0.7)'; // Increase brightness
      }

    });
  
    element.addEventListener("mouseout", () => {
      element.style.backgroundColor = "#FFFFFF";
      element.style.color = "#4f4f4f";
      element.style.fontWeight = "500";
      element.style.border = "1px solid #4f4f4f";

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
        // const descriptionImg = document.createElement("img");
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        // descriptionImg.title = description;
        descriptionImg.style.marginRight = "10px";
        descriptionImg.style.width = "18px";
        descriptionImg.style.height = "18px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);

      if (childCount > 0) {
        // const hoverCircleImg = document.createElement("img");
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        var tooltip = `${childCount} sub categories`;
        // hoverCircleImg.title = `${childCount} sub categories`;
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
          // skillButton.style.backgroundColor = "#E0DEFF";
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
          const childSkills = await this.fetchSkills(childSkillApiEndpoint);
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
        const parentSkills = await this.fetchSkills(parentSkillApiEndpoint);
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
        const skills = await this.fetchSkills(childSkillApiEndpoint);
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
    console.log(currentBreadcrumbItem);
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
      CardBody.style.padding = "12px 12px";
      CardBody.classList.add("card-body-accordion");
      CardBody.style.borderRadius = "10px";
      CardBody.style.margin = "10px 0px";
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
            // skillButton.style.backgroundColor = "#E0DEFF";
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
            console.log("zeroskill-data", skill);
            this.changeRateModelElement(skill);
          } else {
            if (skill.child_count > 0 && skill.name !== "Related Skills") {
              const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
              const childSkills = await this.fetchSkills(childSkillApiEndpoint);
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
    console.log(skills);
    console.log(skillId, "childrenskillid");
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

      // if (highlightSkill && skill.name === highlightSkill) {
      //   skillButton.style.backgroundColor = "#45e5c6";
      //   skillButton.style.border="1px solid #16a085";
      //   skillButton.style.color="#ffffff";
      // }
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
        // const descriptionImg = document.createElement("img");
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        // descriptionImg.title = description;
        descriptionImg.style.marginRight = "10px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);

      if (childCount > 0) {
        // const hoverCircleImg = document.createElement("img");
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        var tooltip = `${childCount} sub categories`;
        // hoverCircleImg.title = `${childCount} sub categories`;
        hoverCircleImg.style.marginLeft = "5px";
        buttonContentDiv.appendChild(hoverCircleImg);
        manageTooltip(hoverCircleImg, tooltip);
      }

      if (ratingsCount > 0) {
        const searchText = searchByName(skill.name,skill.path_addr);
        console.log(searchText);
        if (searchText.length > 0) {
          console.log("entered");
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
          // skillButton.style.backgroundColor = "#E0DEFF";
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
          console.log("zeroskill-data", skill);
          this.changeRateModelElement(skill);
        } else if (skill.name === "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
          const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
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
            const childSkills = await this.fetchSkills(childSkillApiEndpoint);
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
      // breadcrumbLink.style.cursor = "pointer";
      breadcrumbLink.style.color =
        index === breadcrumbPath.length - 1 ? "rgb(51, 51, 51)" : "rgb(0, 102, 204)";
      breadcrumbLink.style.fontWeight = index === breadcrumbPath.length -1 ? "bold" : "normal";
      breadcrumbLink.style.fontSize = "15px";
      breadcrumbLink.style.marginRight = "5px";

      breadcrumbLink.addEventListener("click", async () => {
        const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
        const skills = await this.fetchSkills(childSkillApiEndpoint);
        const childrenSkills = skills.filter(
          (item) => item.name !== "Related Skills"
        );
        console.log(childrenSkills, "childrenSkills");

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
          const parentSkills = await this.fetchSkills(parentSkillApiEndpoint);

          // Filter out skills with child_count equal to 1
          // const validParentSkills = parentSkills.filter(skill => skill.child_count !== 1);

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

      // Log skills and breadcrumbPath for debugging
      console.log("Skills:", skills);
      console.log("Breadcrumb Path:", breadcrumbPath);
      console.log("Clicked Skill Path:", clickedSkillPath);

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
          console.log("Clicked Skill for Rating:", clickedSkill); // Debugging log
          this.changeRateModelElement(clickedSkill);
        });

        breadcrumb.appendChild(rateButton);
      }
    }

    // Append breadcrumb to accordion
    softSkillAccordian.appendChild(breadcrumb);
  }

  renderRelatedHardSkills(skills, breadcrumbPath, softSkillAccordian, skillId) {
    console.log(skillId, "relatedskillid");
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
        // descriptionImg.title = description;
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
        // hoverCircleImg.title = `${childCount} sub categories`;
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
          console.log("zeroskill-data", skill);
          this.changeRateModelElement(skill);
        } else {
          const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
          const childSkills = await this.fetchSkills(childSkillApiEndpoint);
          const validParentSkills = childSkills.filter(
            (skill) => skill.name !== "Related Skills"
          );
          console.log(validParentSkills);
          const newBreadcrumbPath = [
            ...breadcrumbPath,
            {
              name: skill.name,
              path_addr: skill.path_addr,
              ratings: skill.ratings,
            },
          ];
          console.log(newBreadcrumbPath, "breadcrumb");
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
    console.log(skillId);
    console.log(skillName);
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
        console.log(skillId); // Ensure skillId is logged correctly
        const parentSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${hardSkillId}`; // Use hardSkillId consistently
        const parentSkills = await this.fetchSkills(parentSkillApiEndpoint);
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
          // skillName,
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
      // breadcrumbLink.style.cursor = "pointer";
      breadcrumbLink.style.color =
        index === breadcrumbPath.length - 1 ? "rgb(51, 51, 51)" : "rgb(0, 102, 204)";
      breadcrumbLink.style.fontWeight = index === breadcrumbPath.length -1 ? "bold" : "normal";
      breadcrumbLink.style.fontSize = "15px";
      breadcrumbLink.style.marginRight = "5px";

      breadcrumbLink.addEventListener("click", async () => {
        if (breadcrumbItem.name == "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
          const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
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
          const skills = await this.fetchSkills(childSkillApiEndpoint);
          const childrenSkills = skills.filter(
            (item) => item.name !== "Related Skills"
          );
          console.log(childrenSkills, "childrenSkills");

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
        // this.showPopup(event, currentBreadcrumbItem);
        this.saveTheSkillComment("", "", currentBreadcrumbItem, "");
      });

      breadcrumb.appendChild(rateButton);
    }

    // Append breadcrumb to accordion
    softSkillAccordian.appendChild(breadcrumb);
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
    console.log(skills);
    console.log(skillId, "childrenskillid");
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
    // Create buttons for each skill
    const skillsContainer = document.createElement("div");
    skillsContainer.classList.add("softskillparentaccordian");
    skillsContainer.setAttribute("id", "softskillparentaccordian");
    skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
    skillsContainer.style.textAlign = "left";

    skills.forEach((skill) => {
      // if(skill.child_count >0 || skill.ratings.length >0){
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

      // if (highlightSkill && skill.name === highlightSkill) {
      //   skillButton.style.backgroundColor = "#45e5c6";
      //   skillButton.style.border="1px solid #16a085";
      //   skillButton.style.color="#ffffff";
      // }
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
        // const descriptionImg = document.createElement("img");
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        descriptionImg.style.marginRight = "10px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);
      if (childCount > 0 && childCount != 1) {
        // const hoverCircleImg = document.createElement("img");
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        const tooltip = `${childCount} sub categories`;
        hoverCircleImg.style.marginLeft = "5px";
        buttonContentDiv.appendChild(hoverCircleImg);
        manageTooltip(hoverCircleImg, tooltip);
      }
      else if (childCount === 1) {
        // Fetch child skills if childCount is 1
        const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        this.fetchSkills(childSkillApiEndpoint).then((childSkills) => {
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

      // if (ratingsCount > 0) {
      //   const searchText = searchByName(skill.name,skill.path_addr);
      //   if (searchText.length > 0) {
      //     const starIcon = document.createElement("img");
      //     starIcon.src = `${imagePath}Group 23.svg`;
      //     starIcon.style.marginLeft = "5px";
      //     starIcon.style.cursor = "pointer";
      //     starIcon.addEventListener("click", (event) => {
      //       event.stopPropagation();
      //       this.changeRateModelElement(skill);
      //     });
      //     buttonContentDiv.appendChild(starIcon);
      //     skillButton.classList.add('rated-skill');
      //     // skillButton.style.backgroundColor = "#E0DEFF";
      //   } else {
      //     const starIcon = document.createElement("i");
      //     starIcon.className = "fas fa-star";
      //     starIcon.setAttribute("id", skill.path_addr);
      //     starIcon.style.marginLeft = "5px";
      //     starIcon.style.cursor = "pointer";
      //     starIcon.style.color = "#ccccff";
      //     starIcon.addEventListener("click", (event) => {
      //       event.stopPropagation();
      //       this.changeRateModelElement(skill);
      //     });
      //     buttonContentDiv.appendChild(starIcon);
      //   }
      // }

      if (ratingsCount > 0) {
        const searchText = searchByName(skill.name, skill.path_addr);
        if (searchText.length > 0) {
            const starIcon = document.createElement("img");
            starIcon.src = `${imagePath}Group 25.svg`;
            starIcon.style.marginLeft = "5px";
            starIcon.style.cursor = "pointer";
            starIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                // this.showPopup(event, skill); // Call the popup function
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
                // this.showPopup(event, skill); // Call the popup function
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
          const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
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
            // if(skill.ratings.length > 0){
            //   let objExist = checkElementExist(skill);
            //   if(!objExist){
            //     this.changeRateModelElement(skill);
            //   }
            // }
            // if (skill.ratings.length > 0){
            //   const hasLogginRated = localStorage.getItem("logginUserRatedSkills");
            //   const hasUserRated = localStorage.getItem("userRatedSkills");

            //   let ratedSkills = [];

            //   if (hasLogginRated) {
            //     ratedSkills = JSON.parse(hasLogginRated);
            //   } else if (hasUserRated) {
            //     ratedSkills = JSON.parse(hasUserRated);
            //   }
              
            //   const isParentRated = ratedSkills.some(
            //     (ratedSkill) =>
            //       ratedSkill.isot_file.name === skill.name &&
            //       ratedSkill.isot_file.path_addr === skill.path_addr
            //   );

            //   if (!isParentRated) {
            //     warningPopup.style.display = "block";
            //     setTimeout(() => {
            //       warningPopup.style.display = "none";
            //     }, 3000);
            //     return;
            //   }
            // }
            const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
            const childSkills = await this.fetchSkills(childSkillApiEndpoint);
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

      skillButton.style.position = "relative"; 
      skillButton.appendChild(warningPopup);
      skillsContainer.appendChild(skillButton);
      // }
    });
    softSkillAccordian.appendChild(skillsContainer);
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
    console.log(skills);
    console.log(skillId, "childrenskillid");
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

      // if (highlightSkill && skill.name === highlightSkill) {
      //   skillButton.style.backgroundColor = "#45e5c6";
      //   skillButton.style.border="1px solid #16a085";
      //   skillButton.style.color="#ffffff";
      // }
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
        // const descriptionImg = document.createElement("img");
        descriptionImg.src = `${imagePath}Group 27.svg`;
        descriptionImg.alt = "description";
        // descriptionImg.title = description;
        descriptionImg.style.marginRight = "10px";
        buttonContentDiv.appendChild(descriptionImg);
        manageTooltip(descriptionImg, description);
      }

      buttonContentDiv.appendChild(skillNameSpan);

      if (childCount > 0 && childCount !=1) {
        // const hoverCircleImg = document.createElement("img");
        hoverCircleImg.src = `${imagePath}hovercircleplus.png`;
        hoverCircleImg.alt = "circle";
        hoverCircleImg.style.width = "20px";
        hoverCircleImg.style.height = "20px";
        var tooltip = `${childCount} sub categories`;
        // hoverCircleImg.title = `${childCount} sub categories`;
        hoverCircleImg.style.marginLeft = "5px";
        buttonContentDiv.appendChild(hoverCircleImg);
        manageTooltip(hoverCircleImg, tooltip);
      }
      else if (childCount === 1) {
        // Fetch child skills if childCount is 1
        const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        this.fetchSkills(childSkillApiEndpoint).then((childSkills) => {
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
      // if (ratingsCount > 0) {
      //   const searchText = searchByName(skill.name,skill.path_addr);
      //   if (searchText.length > 0) {
      //     const starIcon = document.createElement("img");
      //     starIcon.src = `${imagePath}Group 23.svg`;
      //     starIcon.style.marginLeft = "5px";
      //     starIcon.style.cursor = "pointer";
      //     starIcon.addEventListener("click", (event) => {
      //       event.stopPropagation();
      //       this.changeRateModelElement(skill);
      //     });
      //     buttonContentDiv.appendChild(starIcon);
      //     skillButton.classList.add('rated-skill');
      //     // skillButton.style.backgroundColor = "#E0DEFF";
      //   } else {
      //     const starIcon = document.createElement("i");
      //     starIcon.className = "fas fa-star";
      //     starIcon.setAttribute("id", skill.path_addr);
      //     starIcon.style.marginLeft = "5px";
      //     starIcon.style.cursor = "pointer";
      //     starIcon.style.color = "#ccccff";
      //     starIcon.addEventListener("click", (event) => {
      //       event.stopPropagation();
      //       this.changeRateModelElement(skill);
      //     });
      //     buttonContentDiv.appendChild(starIcon);
      //   }
      // }

      if (ratingsCount > 0) {
        const searchText = searchByName(skill.name, skill.path_addr);
        if (searchText.length > 0) {
            const starIcon = document.createElement("img");
            starIcon.src = `${imagePath}Group 25.svg`;
            starIcon.style.marginLeft = "5px";
            starIcon.style.cursor = "pointer";
            starIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                // this.showPopup(event, skill); // Call the popup function
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
              // this.showPopup(event, skill); // Call the popup function
              this.saveTheSkillComment("", "", skill, "");
          });
          buttonContentDiv.appendChild(starIcon);
        }
      }

      skillButton.appendChild(buttonContentDiv);

      skillButton.addEventListener("click", async () => {
        // if (skill.child_count === 0) {
        //     console.log("zeroskill-data", skill);
        //     this.changeRateModelElement(skill);
        // } else {
        //     const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
        //     const childSkills = await this.fetchSkills(childSkillApiEndpoint);
        //     const newBreadcrumbPath = [...breadcrumbPath, { name: skill.name, path_addr: skill.path_addr, ratings: skill.ratings }];
        //     this.renderCategoryHardSkills(childSkills, newBreadcrumbPath, softSkillAccordian, skillId, parentskills,skillName);
        // }
        if (skill.child_count === 0 && skill.ratings.length > 0) {
          console.log("zeroskill-data", skill);
          // this.changeRateModelElement(skill);
        } else if (skill.name === "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
          const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
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
            // if(skill.ratings.length > 0){
            //   let objExist = checkElementExist(skill);
            //   if(!objExist){
            //     this.changeRateModelElement(skill);
            //   }
            // }
            // if (skill.ratings.length > 0){
            //   const hasLogginRated = localStorage.getItem("logginUserRatedSkills");
            //   const hasUserRated = localStorage.getItem("userRatedSkills");

            //   let ratedSkills = [];

            //   if (hasLogginRated) {
            //     ratedSkills = JSON.parse(hasLogginRated);
            //   } else if (hasUserRated) {
            //     ratedSkills = JSON.parse(hasUserRated);
            //   }
              
            //   const isParentRated = ratedSkills.some(
            //     (ratedSkill) =>
            //       ratedSkill.isot_file.name === skill.name &&
            //       ratedSkill.isot_file.path_addr === skill.path_addr
            //   );

            //   if (!isParentRated) {
            //     warningPopup.style.display = "block";
            //     setTimeout(() => {
            //       warningPopup.style.display = "none";
            //     }, 3000);
            //     return;
            //   }
            // }
            const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
            const childSkills = await this.fetchSkills(childSkillApiEndpoint);
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
    console.log(skillId);
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
        console.log(skillId); // Ensure skillId is logged correctly
        const parentSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${hardSkillId}`; // Use hardSkillId consistently
        const parentSkills = await this.fetchSkills(parentSkillApiEndpoint);
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
      // breadcrumbLink.style.cursor = "pointer";
      breadcrumbLink.style.color =
        index === breadcrumbPath.length - 1 ? "rgb(51, 51, 51)" : "rgb(0, 102, 204)";
      breadcrumbLink.style.fontWeight = index === breadcrumbPath.length -1 ? "bold" : "normal";
      breadcrumbLink.style.fontSize = "15px";
      breadcrumbLink.style.marginRight = "5px";

      breadcrumbLink.addEventListener("click", async () => {
        // if(index === 0){
        //   const parentSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
        //   const parentSkills = await this.fetchSkills(parentSkillApiEndpoint);
        //   const filterSkills = parentSkills.filter(
        //     (item) => item.name !== "Related Skills"
        //   );
        //   const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);
        //   this.renderCategoryHardSkills(
        //     filterSkills,
        //     newBreadcrumbPath,
        //     softSkillAccordian,
        //     skillId,
        //     filterSkills,
        //     skillName,
        //     highlightSkill,
        //   );
        //   const allButtons = document.querySelectorAll(".softskillbutton");
        //   allButtons.forEach((btn) =>
        //     btn.classList.remove("active-skill-button")
        //   );
        //   return;
        // }
        if (breadcrumbItem.name == "Related Skills") {
          const relatedSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
          const relatedSkills = await this.fetchSkills(relatedSkillApiEndpoint);
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
          const skills = await this.fetchSkills(childSkillApiEndpoint);
          const childrenSkills = skills.filter(
            (item) => item.name !== "Related Skills"
          );
          console.log(childrenSkills, "childrenSkills");

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
        // this.showPopup(event, currentBreadcrumbItem);
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
// document.addEventListener("DOMContentLoaded", function () {
//   updateProfileData();
// });
