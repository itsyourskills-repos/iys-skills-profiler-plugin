var isLoginUser = JSON?.parse(localStorage?.getItem("loginUserDetail"))
  ? true
  : false;
  console.log("LoginUser",isLoginUser);
const ENDPOINT_URL = "https://lambdaapi.iysskillstech.com/latest/dev-api/";
const loggedInUserApiEndpoint = `https://api.myskillsplus.com/get-skills/`;
const loggedInUserAddSkill = `https://api.myskillsplus.com/add-skills/`;
const deleteSkillApiEndpoint = `https://api.myskillsplus.com/delete-skill/`;
const getaccessYokenEndpoint =
  "https://api.myskillsplus.com/api/token/refresh/";
const getAccessToken = JSON.parse(localStorage.getItem("tokenData"));
const imagePath="https://cdn.jsdelivr.net/gh/itsyourskills-repos/iys-skills-profiler-plugin@uatplugin/assets/img/";
// const configuratorvalue=localStorage.setItem('iys', JSON.stringify({
//   tap: "all",
//   profile_view: "all",
//   isEdit: true,
//   isDelete: true,
//   doughnt:true,
//   experience:true,
// }));

var iysplugin=JSON.parse(localStorage.getItem("iys"));
console.log(iysplugin);
if (iysplugin == null) {
  iysplugin = {}; 
  iysplugin.tap = "all";
  iysplugin.profile_view = "all";
  iysplugin.isEdit = true;
  iysplugin.isDelete = true;
  iysplugin.doughnt=true;
  iysplugin.experience=true;
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
        window.location.href = "/limit-exceeded/";
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

function checkElementExist(skillDetail) {
  console.log(skillDetail, "skillDetail");
    if (localStorage.getItem("logginUserRatedSkills")) {
        let userRatedSkills = JSON.parse(
            localStorage.getItem("logginUserRatedSkills", "[]"),
        );

        const lastTwoId = skillDetail.path_addr.split(".").slice(-2).join(".");

        console.log("lastTwoId", lastTwoId);
        console.log("userRatedSkills", userRatedSkills);

        // checking it atlest have parent id
        if (lastTwoId.split(".").length >= 2 && userRatedSkills) {
            let foundObject = userRatedSkills.find((skill) =>
                skill.isot_path_addr.endsWith(lastTwoId),
            );
            if (foundObject) {
                return foundObject;
            }
        }
        let foundObject = userRatedSkills?.find((skill) =>
            skill.isot_path_addr.endsWith(skillDetail.path_addr),
        );
        if (foundObject) {
            return foundObject;
        } else {
            return null;
        }
    }
    else{
        let userRatedSkills = JSON.parse(
            localStorage.getItem("userRatedSkills", "[]")
          );
          const lastTwoId = skillDetail.path_addr.split(".").slice(-2).join(".");
          // checking it atlest have parent id
          if (lastTwoId.split(".").length >= 2 && userRatedSkills) {
            let foundObject = userRatedSkills.find((skill) =>
              skill.isot_file_id.endsWith(lastTwoId)
            );
            if (foundObject) {
              return foundObject;
            }
          }
          let foundObject = userRatedSkills?.find((skill) =>
            skill.isot_file_id.endsWith(skillDetail.path_addr)
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
      rating: item?.rating || (item?.ratings[0] && item?.ratings[0].rating),
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
  const htmlElementCount = sortRatingByLocalStorage();
  const sumofAllRatings = sumRatings(htmlElementCount);
  var elementCountLabel = document.querySelector(".elementCountLabel");
  // elementCountLabel.style.width = "fit-content";
  // elementCountLabel.style.padding = "10px 30px";
  elementCountLabel.style.margin = "20px auto";
  elementCountLabel.style.marginTop="20px";
  elementCountLabel.style.marginBottom="20px";
  elementCountLabel.style.paddingTop="7px";
  elementCountLabel.style.paddingBottom="7px";
  elementCountLabel.style.paddingRight="10px";
  elementCountLabel.style.paddingLeft="8px";
  elementCountLabel.style.borderRadius = "30px";
  elementCountLabel.style.textAlign="left";

  // elementCountLabel.style.zIndex = 99;
  if (htmlElementCount && sumofAllRatings) {
    elementCountLabel.style.border = "0.4px solid #E1F7E9";
    elementCountLabel.style.background = "#E1F7E9";
    elementCountLabel.innerHTML = ` <div style="display: flex; align-items: center;">
      <div style="width: 50px; height: 50px; background-color: #5ACB86; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" style="fill: white;">
              <g id="Group_22" data-name="Group 22" transform="translate(538.943 -14.946)">
                  <path id="Path_29" data-name="Path 29" d="M-526.442,14.946a12.526,12.526,0,0,1,12.5,12.5,12.514,12.514,0,0,1-12.517,12.5,12.513,12.513,0,0,1-12.483-12.509A12.511,12.511,0,0,1-526.442,14.946Zm-.013,2.081a10.412,10.412,0,0,0-10.407,10.441,10.413,10.413,0,0,0,10.428,10.4,10.42,10.42,0,0,0,10.409-10.42A10.409,10.409,0,0,0-526.455,17.027Z" transform="translate(0 0)" fill="#fff"/>
                  <path id="Path_30" data-name="Path 30" d="M-406.508,192.806a2.3,2.3,0,0,1,.188-.252q3.13-3.135,6.264-6.266a1.037,1.037,0,0,1,1.647.075,1.031,1.031,0,0,1-.062,1.265c-.058.068-.123.13-.187.193l-7.007,7.007a1.068,1.068,0,0,1-1.747,0q-1.458-1.458-2.916-2.917a1.034,1.034,0,0,1-.135-1.429,1.028,1.028,0,0,1,1.566-.07c.438.424.865.861,1.3,1.293C-407.251,192.057-406.9,192.409-406.508,192.806Z" transform="translate(-121.989 -162.623)" fill="#fff"/>
              </g>
          </svg>
      </div>
      <div style="margin-left: 10px;"><span style="font-size:18px; color:#5ACB86;"> <span style="font-size:24px; color:#5ACB86;"> ${sumofAllRatings}</span> element added to your profile </span><a id='profile-link' href="#" onclick="openProfileTab()" style="font-size:18px; color:#00A8CB;"> Check your profile</a></div>
    </div>`;
  } else {
    elementCountLabel.style.border = "0.4px solid #FEF4E4";
    elementCountLabel.style.background = "#FEF4E4";
    elementCountLabel.innerHTML = ` <div style="display: flex; align-items: center;">
      <div style="width: 50px; height: 50px; background-color: #D59C66; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
            <g id="Group_9" data-name="Group 9" transform="translate(509.838 -46.052)">
                <path id="Path_16" data-name="Path 16" d="M-484.838,58.546a12.49,12.49,0,0,1-12.487,12.506,12.491,12.491,0,0,1-12.513-12.509,12.489,12.489,0,0,1,12.5-12.491A12.487,12.487,0,0,1-484.838,58.546Zm-2.449.006A10.072,10.072,0,0,0-497.323,48.5a10.073,10.073,0,0,0-10.067,10.051A10.075,10.075,0,0,0-497.353,68.6,10.074,10.074,0,0,0-487.287,58.552Z" fill="#fff"/>
                <path id="Path_17" data-name="Path 17" d="M-335.4,242.973c.161.036.287.056.407.094a1.226,1.226,0,0,1,.826,1.386,1.173,1.173,0,0,1-1.106.994c-.479.019-.959.021-1.438,0a1.175,1.175,0,0,1-1.135-1.187c-.007-1.145,0-2.29,0-3.435v-.338c-.17-.041-.306-.062-.433-.105a1.224,1.224,0,0,1-.8-1.4,1.209,1.209,0,0,1,1.159-.978c.43-.007.861-.005,1.292,0a1.2,1.2,0,0,1,1.226,1.225c.005,1.125,0,2.251,0,3.376Z" transform="translate(-160.709 -180.673)" fill="#fff"/>
                <path id="Path_18" data-name="Path 18" d="M-315.378,154.031a1.231,1.231,0,0,1-1.234,1.227,1.236,1.236,0,0,1-1.219-1.246,1.2,1.2,0,0,1,1.239-1.21A1.192,1.192,0,0,1-315.378,154.031Z" transform="translate(-180.73 -100.479)" fill="#fff"/>
            </g>
        </svg>
      </div>
      <div style="margin-left: 10px;"><span style="font-size:18px; color:#D59C66;"> There are no details added to your profile yet</span></div>
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
function searchByName(searchName) {
  const data = sortRatingByLocalStorage();
  const searchResult = [];
  data.forEach((item) => {
    item.RatedSkills.forEach((skill) => {
      if (
        skill.isot_file.name.toLowerCase().includes(searchName.toLowerCase())
      ) {
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

function transformDataFromLocalStorage(originalData) {
  const transformedData = { skills: [] };
  originalData?.forEach((skill) => {
      const { isot_file_id, rating } = skill;
      // console.error(skill, "skill", isot_path_addr, rating);

      if (!isot_file_id) {
      return;
      } else {
      transformedData.skills.push({
          path_addr: isot_file_id,
          ratings: rating ? rating : [],
      });
      }
  });

  //   if (!ratingsMap.has(isot_file_id)) {
  //     ratingsMap.set(isot_file_id, []);
  //   }

  //   ratingsMap.get(isot_file_id).push({ isot_rating_id, rating, comment });
  // });

  // for (const [path_addr, ratings] of ratingsMap) {
  //   transformedData.skills.push({ path_addr, ratings });
  // }

  console.warn("transformedData", transformedData);
  return transformedData;
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
}

function getListFromlocalStorage() {
  if (localStorage.getItem("userRatedSkills")) {
    return JSON.parse(localStorage.getItem("userRatedSkills"));
  } else if (localStorage.getItem("logginUserRatedSkills")) {
    return JSON.parse(localStorage.getItem("logginUserRatedSkills"));
  } else {
    return [];
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
  const apiEndpoint = `https://lambdaapi.iysskillstech.com/v2/add/skills?name=${payload.name}&cat=${payload.cat}&email=${payload.email}`;
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
      toastr.success("New skill element added!");
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
          window.location.href = "/limit-exceeded/";
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
    if (typeof config == "object") {
      this.options = {
        ...this.options,
        ...config,
      };
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
    div.classList.add("input-group", "input-group-lg", "shadow");
    div.style.display = "flex";
    div.style.flexDirection = "row";
    div.style.borderRadius = "10px";
    div.style.border = "1px solid #007DFC1A";

    const input = document.createElement("input");
    this.searchInputBox = input;
    input.id = "plugin-search-id";
    input.classList.add("form-control");
    input.autocomplete="off";
    input.setAttribute("aria-label", "Sizing example input");
    input.setAttribute(
      "placeholder",
      "Search Profile / Skill / Technology / Domain / Activity"
    );
    input.setAttribute("aria-describedby", "inputGroup-sizing-lg");
    input.style.fontSize = "1rem";
    input.style.height = "auto";
    input.style.borderRadius = "10px";
    input.style.border = "none";
    input.style.paddingLeft = "50px";
    input.style.paddingTop = "20px";
    input.style.paddingBottom = "20px";
    input.type = "search";
    input.style.background = `transparent url("${imagePath}Group 3.svg")`;
    input.style.backgroundRepeat = 'no-repeat';
    input.style.backgroundPositionX = '13px';
    input.style.backgroundPositionY = 'center';

    // const iclass=document.createElement("i");
    // iclass.className="fas fa-search";
    // input.appendChild(iclass);
    div.appendChild(input);

    // Create the clear icon
    const clearIcon = document.createElement("span");
    clearIcon.id = "plugin-search-id-close-button";
    clearIcon.innerHTML = "&times;";
    clearIcon.style.position = "absolute";
    clearIcon.style.right = "130px";
    clearIcon.style.top = "20%";
    // clearIcon.style.transform = "translateY(-20%)";
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
    button.style.paddingRight = "34px";
    button.style.paddingLeft="34px";
    button.style.borderRadius = "10px";
    button.style.margin = "6px";
    button.style.border = "none";
    button.style.background = "#007DFC";
    button.style.color = "white";
    button.style.position = "absolute";
    button.style.right = "0";
    button.style.height = "78%";
    button.style.top = "0px";
    button.classList.add("d-none", "d-lg-block");
    button.innerHTML = `${formattedText}`;
    // button.innerHTML = `<i class="fas fa-search" style="margin-right: 8px;"></i> ${formattedText}`; // Add your icon HTML here
    button.setAttribute("aria-label", "Search");

    // Add click event to trigger the searchAPI method
    button.addEventListener("click", () => {
      if (input.value !== "") {
        this.searchAPI();
      }
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
    divDropDown.style.width = "96.5%";
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
      if (this.searchValue?.length > 1) {
        this.searchAPI(this.searchValue);
      }
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
    if (this.selectedSkilldiv) {
      this.createSelectedSkillList();
    }
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
        li.style.color="#636363";
        li.style.fontSize="16px";
        // li.style.borderBottom = "1px solid #E0E0E0";
        li.addEventListener("click", (event) => {
          console.log("clicked");
          this.skillClick(i);
          div.style.display = "none";
          this.selectedASkillBox.style.display = "block";
          // remove local storages
          // clearlocalStorage();
        });
        const addMorePlusIcon =
          searchResultsList[i]?.skills[0]?.child_count > 1
            ? '<i class="fa fa-plus"></i>'
            : "";
        const a = document.createElement("a");
        a.classList.add("dropdown-item");
        a.style.wordWwrap = "break-word";
        a.style.whiteSpace = "pre-wrap";
        a.href = "#";
        a.innerHTML =
          addMorePlusIcon +
          " " +
          this.searchHighlight(
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
    console.log(this.options);
    let pluginDiv = document.getElementById(this.options.pluginDivId);

    if (pluginDiv) {
      pluginDiv.appendChild(modalDiv);
    } else {
      console.error(`Element with ID ${this.options.pluginDivId} not found.`);
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

  searchHighlight(searched, text) {
    if (searched !== "") {
      const searchTerms = searched.split(" ");
      const newText = text.replace(
        new RegExp(searchTerms.join("|"), "gi"),
        (match) => `<b>${match}</b>`
      );
      return newText;
    }
    return text;
  }

  searchAPI() {
    // this.searchInputBox.classList.add("loading");
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

    if (isLoginUser && this.searchValue.length > 0) {
      fetch(
        `https://api.myskillsplus.com/api-search/?q=${this.searchValue.trim()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken?.access}`,
          },
        }
      )
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
    } else if (this.searchValue.trim().length > 0) {
      fetch(`${ENDPOINT_URL}?q=${this.searchValue.trim()}&limit=10`)
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
            this.createSkillSearchList(
              response.matches,
              this.searchValue.trim()
            );
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
  }

  setupDiv() {
    // Create card div
    var cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.style.fontFamily="system-ui";

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

    var navElement = document.createElement("nav");
    navElement.style = "padding-top:20px; padding-left:10px; margin-left:5px;";

    var containerDiv = document.createElement("div");
    containerDiv.className = "container-fluid d-flex";

    var buttonContainerDiv = document.createElement("div");
    buttonContainerDiv.style="margin-left:auto;";

    var ulElement = document.createElement("ul");
    ulElement.className = "nav nav-tabs";
    ulElement.id = "myTab0";

    // Create home tab
    var homeTab = createTab("home", "Search", `${imagePath}Group 1.svg`, "#E8F2FF","#024FAB");

    // Profile tab
    var profileTab = createTab("profile", "View Profile", `${imagePath}Group 2.svg`, "#E8F2FF","#024FAB");

    // Append li elements to ul element
    if(iysplugin.tap=="all" || iysplugin.tap=="search"){
      ulElement.appendChild(homeTab);
      ulElement.appendChild(profileTab);
    }

    buttonContainerDiv.appendChild(ulElement);
    containerDiv.appendChild(buttonContainerDiv);
    navElement.appendChild(containerDiv);

    cardDiv.appendChild(navElement);

    // Function to create tab button
    function createTab(id, labelText, imagePath, backgroundColor, color) {
      var liElement = document.createElement("li");
      liElement.className = "nav-item";
    
      var button = document.createElement("button");
      button.setAttribute("data-mdb-tab-init", "");
      if(id=="home"){
        button.style.display="none";
        button.className="nav-link px-3 active"
      }
      else{
        button.className = "nav-link px-3";
      }
      button.id = id + "-tab0";
      button.setAttribute("data-mdb-target", "#" + id + "0");
      button.style.paddingTop = "0.6rem";
      button.style.paddingBottom = "0.5rem";
      button.style.textAlign = "center";
      button.style.color = color;
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", id);
      button.style.background = backgroundColor;
      button.style.borderRadius = "30px";
      button.style.marginRight = "10px";
    
      var iconDiv = document.createElement("div");
      iconDiv.className = "d-flex flex-row align-items-center gap-2";
      
      var img = document.createElement("img");
      img.src = imagePath;
      img.alt = labelText + " icon";
      img.style.width = "20px";
      img.style.height = "20px";
      // img.className = "py-2";
    
      var small = document.createElement("small");
      small.textContent = labelText;
    
      iconDiv.appendChild(img);
      iconDiv.appendChild(small);
      button.appendChild(iconDiv);
      liElement.appendChild(button);

      button.addEventListener('click', function() {
        toggleButtons(id);
      });
    
      return liElement;
    }
    
    function toggleButtons(activeId) {
      var homeButton = document.getElementById("home-tab0");
      var profileButton = document.getElementById("profile-tab0");
    
      if (activeId === "home") {
        homeButton.style.display = "none";
        profileButton.style.display = "block";
      } else if (activeId === "profile") {
        profileButton.style.display = "none";
        homeButton.style.display = "block";
      }
    }
    
    // Append nav element to card div
    cardDiv.appendChild(navElement);

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
    var groupSkilltypeDiv=document.createElement("div");
    groupSkilltypeDiv.className="container-fluid px-md-3";

    var skillGroupDiv=document.createElement("div");
    // skillGroupDiv.className="my-3";
    skillGroupDiv.style="margin-top:1rem; padding-right:7px; padding-left:7px;";

    var skillGroupNavDiv=document.createElement("div");
    skillGroupNavDiv.className="nav nav-pills m-0";
    skillGroupNavDiv.id="skillsTab";
    skillGroupNavDiv.style="padding-right:10px; box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 10px;";

    var skillGroupButton=document.createElement("div");
    skillGroupButton.className="d-flex";
    skillGroupButton.setAttribute("role", "group");
    skillGroupButton.setAttribute("aria-label", "Three views");
    skillGroupButton.style = "padding-right: 6px; padding-left:6px; padding-top:2px; padding-bottom:2px;";

    var hardSkills = createSkillTabButton(
      "hard-skills",
      "#hard-skills-content",
      "fa-wand-magic-sparkles",
      "HARD SKILLS",
      "Knowledge and Skills related to concepts, methods, processes, technologies, tools and such"
    );
    // hardSkills.style.marginRight="14px";
    hardSkills.style.marginLeft="15px";
    var softSkills = createSkillTabButton(
        "soft-skills",
        "#soft-skills-content",
        "fa-table",
        "SOFT SKILLS",
        "Cognitive/Thinking, People skills, Traits and such"
    );
    softSkills.style.marginLeft="15px"
    var role = createSkillTabButton(
        "role",
        "#role-tab-content",
        "fa-wand-magic-sparkles",
        "ROLE",
        "The time spent on individual contribution, managing, leading and such"
    );
    role.style.marginLeft="15px";

    skillGroupButton.appendChild(hardSkills);
    skillGroupButton.appendChild(softSkills);
    // skillGroupButton.appendChild(role);

    skillGroupNavDiv.appendChild(skillGroupButton);

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
    contentImg.style.width="100%";
    contentImg.style.height="auto";
    // contentImg.style.height = "466px";

    var contentText1 = document.createElement("span");
    contentText1.textContent = "EXPERIENCE THE RICHNESS OF SKILLS TAXONOMY HERE";
    contentText1.style= "text-align:center; color:#0050AF; font-size:25px; margin-top:10px;";

    var contentText2 = document.createElement("span");
    contentText2.textContent = "SEARCH FOR A SKILL OR OCCUPATION";
    contentText2.style= "text-align:center; color:#0050AF; font-size:25px;";

    imgBodyDiv.appendChild(contentImg);
    imgBodyDiv.appendChild(contentText1);
    imgBodyDiv.appendChild(contentText2);
    homeTabDiv.appendChild(imgBodyDiv);
    //end the first page content image

    var cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body";
    cardBodyDiv.style.display="none";

    // Create softSkillDetail div
    var softSkillDetail = document.createElement("div");
    softSkillDetail.style.padding = "5px";
    softSkillDetail.classList.add("softskillaccordian");
    softSkillDetail.style.backgroundColor = "#EFF4FA";
    softSkillDetail.style.borderRadius = "10px";
    softSkillDetail.style.height = "auto";
    softSkillDetail.style.display = "none";
    softSkillDetail.style.margin = "20px";
    softSkillDetail.style.boxShadow = "rgba(0, 0, 0, 0.1) 2px 2px 10px";
    softSkillDetail.setAttribute("id", "softskillaccordian");
    softSkillDetail.setAttribute("data-mdb-target", "#soft-skills");
    var softSkillDescriptionDiv=document.createElement("div");
    var softSkillDescriptionDiv = document.createElement("div");
    softSkillDescriptionDiv.className = "softSkillDescription";
    softSkillDescriptionDiv.style="display:none; margin: 20px;border-radius: 10px; background-color: white; box-sizing: border-box; box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 8px;";
    var firstLine = document.createElement("p");
    firstLine.textContent = "Explore the different Soft Skills and select those that you associate with most.";
    firstLine.style="font-weight:500; margin:0px; padding:10px; padding-bottom:0px;"; 

    var secondLine = document.createElement("p");
    secondLine.textContent = "NOTE: Choose only those that you associate with closely. Keep the overall number of figures between 10 to 20. A large number will dilute your profile.";
    secondLine.style="padding:10px; font-weight:300;"

    softSkillDescriptionDiv.appendChild(firstLine);
    softSkillDescriptionDiv.appendChild(secondLine);
    homeTabDiv.appendChild(softSkillDescriptionDiv);
    homeTabDiv.appendChild(softSkillDetail);

    var roleDetail = document.createElement("div");
    roleDetail.style.padding = "5px";
    roleDetail.classList.add("roleaccordian");
    roleDetail.style.backgroundColor="#EFF4FA";
    roleDetail.style.borderRadius="10px";
    roleDetail.style.height = "auto";
    roleDetail.style.display = "none";
    roleDetail.style.margin="20px";
    roleDetail.style.boxShadow="rgba(0, 0, 0, 0.1) 2px 2px 10px;"
    roleDetail.setAttribute("id", "roleaccordian");
    roleDetail.setAttribute("data-mdb-target","#soft-skills");
    homeTabDiv.appendChild(roleDetail);

    $(document).ready(() => {
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
    cardBodyDiv.appendChild(elementCountLabelDiv);
    cardBodyDiv.appendChild(tabContentDiv2);
    homeTabDiv.appendChild(cardBodyDiv);

    // Append home tab pane div to tab content div
    tabContentDiv.appendChild(homeTabDiv);

    // Create profile tab pane div
    var profileTabDiv = document.createElement("div");
    profileTabDiv.className = "tab-pane fade container-fluid";
    profileTabDiv.style="padding:30px;"
    profileTabDiv.id = "profile0";
    profileTabDiv.setAttribute("role", "tabpanel");
    profileTabDiv.setAttribute("aria-labelledby", "profile-tab0");

    if(iysplugin.tap=="profile"){
      profileTabDiv.classList="show active";
      homeTabDiv.classList="d-none";
    }

    var containerFluidDiv = document.createElement("div");
    // containerFluidDiv.className = "container-fluid px-md-3 pb-md-3";
    containerFluidDiv.className = "container-fluid";
    containerFluidDiv.style="background-color:#EFF4FA; padding:30px; border-radius:10px; border:2px solid #EFF4FA;"

    var mb4mt3Div = document.createElement("div");
    mb4mt3Div.className = "mb-4 mt-3";
    var h3Element = document.createElement("p");
    h3Element.className = "h3";
    h3Element.style="color:#1E1E1E;"
    h3Element.textContent = "Skill Profile";
    var pElement = document.createElement("p");
    pElement.className = "p-0 m-0";
    pElement.style="color:#9B9B9B";
    pElement.textContent = "You have skills added to your profile.";

    mb4mt3Div.appendChild(h3Element);
    mb4mt3Div.appendChild(pElement);

    var my3Div = document.createElement("div");
    my3Div.className = "my-3";
    my3Div.style="background-color:#FFFFFF; border-radius:10px; padding:20px;"

    var navPillsDiv = document.createElement("div");
    navPillsDiv.className = "nav nav-pills m-0";
    navPillsDiv.id = "viewsTab";
    navPillsDiv.style="display:inline-block; width:100%;"

    var btnGroupDiv = document.createElement("div");
    btnGroupDiv.className = "d-flex";
    // btnGroupDiv.setAttribute("role", "group");
    btnGroupDiv.setAttribute("aria-label", "Three views");
    btnGroupDiv.style = "padding: 1px; box-shadow:none !important; border-bottom:2px solid #E9EDF1;";

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

    if(iysplugin.profile_view=="quick"){
      btnGroupDiv.appendChild(quickTabButton);
    }
    else if(iysplugin.profile_view=="tablular"){
        btnGroupDiv.appendChild(tabularTabButton);
    }
    else if(iysplugin.profile_view=="all"){
        btnGroupDiv.appendChild(quickTabButton);
        btnGroupDiv.appendChild(tabularTabButton);
    }

    navPillsDiv.appendChild(btnGroupDiv);

    my3Div.appendChild(navPillsDiv);

    var tabContentDiv3 = document.createElement("div");
    tabContentDiv3.className = "tab-content card p-3";
    tabContentDiv3.id = "viewsTabContent0";
    tabContentDiv3.style="box-shadow:none;"

    var quickTabContentDiv = document.createElement("div");
    quickTabContentDiv.className = "tab-pane fade show active";
    quickTabContentDiv.id = "quick-tab-content";
    quickTabContentDiv.setAttribute("role", "tabpanel");
    quickTabContentDiv.setAttribute("aria-labelledby", "home-tab0");

    var h5QuickView = document.createElement("p");
    h5QuickView.className = "h5";
    h5QuickView.textContent = "Quick View";
    h5QuickView.style="color:#0050AF; font-size:18px;"
    var pQuickView = document.createElement("p");
    pQuickView.className = "p-0 m-0";
    pQuickView.textContent =
      "Presents your skills, proficiencies, and notes on the skills. Easy to know what all skills you have";
    pQuickView.style="color:#636363;"
    var quickViewContentDiv = document.createElement("div");
    quickViewContentDiv.id = "quickViewContentDiv";

    quickTabContentDiv.appendChild(h5QuickView);
    quickTabContentDiv.appendChild(pQuickView);
    quickTabContentDiv.appendChild(quickViewContentDiv);

    var tabularTabContentDiv = document.createElement("div");
    tabularTabContentDiv.className = "tab-pane fade";
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

    tabularTabContentDiv.appendChild(h5TabularView);
    tabularTabContentDiv.appendChild(pTabularView);
    tabularTabContentDiv.appendChild(brElement);
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
    modalHeaderDiv.style="padding:15px; background-color:#EFF4FA";

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
    modalBodyDiv.style="padding:30px;"

    // Create span element for star
    var spanElementForStar = document.createElement("div");
    spanElementForStar.id = "spanElementForStar";
    spanElementForStar.style.marginLeft = "0px";
    spanElementForStar.style.marginRight = "0px";

    // Create label for "Remark"
    var remarkLabel = document.createElement("label");
    remarkLabel.className = "fw-bold";
    remarkLabel.style="margin-top:15px; margin-bottom:10px;"
    remarkLabel.textContent = "Remark";

    // Create form outline div
    var formOutlineDiv = document.createElement("div");
    formOutlineDiv.className = "form-outline";
    formOutlineDiv.style="border: 2px solid #E9EDF1"

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
    modalFooterDiv.style="padding:20px;"

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
    tabPaneDiv.style.display="none";
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
    tabularViewHeading.style="color:#0050AF !important";

    // Create tabular view content description
    var tabularViewDescription = document.createElement("p");
    tabularViewDescription.className = "p-0 m-0";
    tabularViewDescription.textContent =
      "Presents your skills in a logical and organized way, like that in our report cards in school.";
    tabularViewDescription.style="color:#636363 !important";

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
      button.style="box-shadow:none;"
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "home");
      button.setAttribute("aria-selected", "true");
      var iconElement = document.createElement("img");
      iconElement.src=iconClass;
      iconElement.className = "me-1";
      button.appendChild(iconElement);
      button.innerHTML += labelText;
      return button;
    }

    function createSkillTabButton(id, dataTarget, iconClass, labelText,tooltipText) {
      var buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      // buttonContainer.style.position = "relative";
      var button = document.createElement("button");
      // button.setAttribute("data-mdb-tab-init", "");
      button.style.width="180px";
      button.style.height="70px";
      button.style.borderRadius="10px";
      button.style.display="flex";
      button.style.alignItems="center";
      button.className = id+" btn nav-link";
      button.style.paddingTop="2.5rem";
      button.style.paddingBottom="2.5rem";
      button.style.paddingLeft="1.5rem";
      button.style.paddingRight="1rem";
      button.style.boxShadow="none";
      // button.style.fontWeight = "bold";
      button.style.color="#1E1E1E";
      button.style.font="normal normal 600 16px/46px Segoe UI;";
      button.style.letterSpacing = "0.5px"; 
      //Image contains the button style
      var iconDiv = document.createElement("button");
      iconDiv.style.width="40px";
      iconDiv.style.height="40px";
      iconDiv.style.justifyContent="center";
      iconDiv.style.border="none";
      iconDiv.style.borderRadius="6px";
      iconDiv.className="d-flex me-2";
      iconDiv.fontWeight="bold";
      //image style
      var iconElement=document.createElement("img");
      iconElement.style.padding="4px"
      iconElement.style.height="37px";
      iconElement.style.width="30px";

      if (id == "hard-skills") {
        button.style.backgroundColor="#F4F3FF";
        iconDiv.style.backgroundColor="#635BFF";
        iconElement.src=`${imagePath}Group 5.svg`;
        iconElement.alt="img";

      }else if (id == "soft-skills") {
        button.style.backgroundColor="#E8FDFC";
        iconDiv.style.backgroundColor="#14E9E2";
        iconElement.src=`${imagePath}Group 7.svg`;
        iconElement.alt="img";
      }else {
        button.style.backgroundColor="#FFEEF3"
        iconDiv.style.backgroundColor="#FF6692";
        iconElement.src=`${imagePath}Group 8.svg`;
        iconElement.alt="img";
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
  }

  createPlayground() {
    this.selectedASkillBox = document.createElement("div");
    this.selectedASkillBox.classList.add("selected-skill-div");
    this.selectedASkillBox.id = "selected-skill-div";
    this.skillPlayground.appendChild(this.selectedASkillBox);
  }

  skillClick(skillListId) {
    console.log(skillListId);
    clearsessionStorage(skillListId);
    this.createSkillSelectBox(this.searchResultsList[skillListId]);
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
    const skillsContainer = document.createElement('div');
    skillsContainer.classList.add('softskillparentaccordian');
    skillsContainer.setAttribute('id', 'softskillparentaccordian');
    skillsContainer.setAttribute('data-mdb-target', '#soft-parent-skills');

    const skillButton = document.createElement('button');
    skillButton.className = 'softskillbutton';
    skillButton.style.border = '1px solid rgb(230, 230, 230)';
    skillButton.style.borderRadius = '10px';
    skillButton.style.margin = '5px';
    skillButton.style.padding = '6px 12px';
    skillButton.style.background = 'white';
    skillButton.style.cursor = 'pointer';
    skillButton.style.color = 'rgb(30, 30, 30)';
    skillButton.style.fontSize = '16px';
    skillButton.setAttribute('data-mdb-tooltip-init', '');

    if (skill.proxy) {
      skillButton.setAttribute('title', skill.proxy + ' ' + skill.name);
    } else {
      skillButton.setAttribute('title', '');
    }

    const childCount = skill.child_count || 0;
    const childCountHtml = childCount > 0 ? `
      <div style="position: relative; text-align: left;">
        <span style="margin-right: 13px;">${skill.name}</span>
        <div style="left: 50%; transform: translateX(-50%); display:inline-block;" title="${childCount} sub categories">
          <span style="height:7px; width:7px; display:inline-block; position:absolute; margin-top:2px; border:2px solid #024FAB;"></span>
          <span style="height:7px; width:7px; display:inline-block; position:relative; border:2px solid #024FAB;"></span>
          <span style="height:7px; width:7px; display:inline-block; position:absolute; margin-top:2px; border:2px solid #024FAB;"></span>
          <span style="height:7px; width:7px; display:inline-block; position:relative; border:2px solid #024FAB;"></span>
        </div>
      </div>
    ` : `<span>${skill.name}</span>`;

    skillButton.innerHTML = childCountHtml;

    skillButton.addEventListener('click', async () => {
      if (skill.child_count === 0) {
        console.log('zeroskill-data', skill);
        this.changeRateModelElement(skill);
      } else {
        htmlElement.innerHTML="";
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
  saveTheSkillComment(
    commentValue,
    ratingValue,
    skillDetail,
    parentSkillDetailId
  ) {
    console.log("saveprocess entered");
    let userRatedSkill = {
      skills: [
        {
          path_addr: skillDetail?.path_addr,
          ratings: ratingValue,
        },
      ],
    };

    const myrate = () => {
      if (parentSkillDetailId === undefined) {
        var ratedButton = document.getElementById("rateBtn");
        ratedButton.style.backgroundColor = "#21965333";
        ratedButton.textContent = "rated";
        ratedButton.innerHTML += `<i class="fas fa-star"></i>`;
        ratedButton.style.color = "black";
        ratedButton.style.fontWeight = "normal";
      }
    };

    if (isLoginUser) {
      const saveButtonElement = document.getElementById("saveChangesButton");
      // Check if the element exists
      console.log(saveButtonElement, "saveButtonElement");
      if (saveButtonElement) {
        const previousContent = saveButtonElement.innerHTML;
        // Create and append the loader
        const loader = document.createElement("div");

        loader.className = "loader rate";
        loader.style.width = "20px";
        loader.style.height = "20px";
        saveButtonElement.textContent = "";
        saveButtonElement.appendChild(loader);
        fetch(loggedInUserAddSkill, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken.access}`,
          },
          body: JSON.stringify(userRatedSkill),
        })
          .then(async (response) => {
            if (response.ok) {
              // Successful response
              toastr.success(
                `Adding Skill ${skillDetail.name}  Added to profile`
              );
              this.updateProfileData();
              await getListFromLoggedInUser("notLoadded");
              myrate();
              if (skillDetail?.path_addr) {
                const elements = document.getElementsByClassName(
                  skillDetail?.path_addr
                );
                console.log(elements, "ratedBtn");
                for (const element of elements) {
                  element.innerHTML = `<i class="fa fa-check"></i> ${skillDetail?.name}`;
                  element.classList.add(
                    skillDetail?.path_addr,
                    "selected-skills"
                  );
                }
              }
              saveButtonElement.removeChild(loader);
              saveButtonElement.innerHTML = previousContent;

              displaySelctedSkills();
              // this.ratedSkillEvent(skillDetail);
            } else {
              // Handle errors
              toastr.success(`Remove Skill ${skillDetail.name} from profile`);

              saveButtonElement.removeChild(loader);
              saveButtonElement.innerHTML = previousContent;
              this.updateProfileData();
            }
          })
          .catch((error) => {
            if (loader && saveButtonElement) {
              saveButtonElement.removeChild(loader);
              saveButtonElement.innerHTML = previousContent;
              this.updateProfileData();
            }
            // Handle network errors
            console.error("Error:", error);
          });
      }
    } 
    else {
      console.log("creating parent for you", parentSkillDetailId);

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

          toastr.success(`Adding Skill ${skillDetail.name}  Added to profile`);
          this.updateProfileData();
          myrate();
          // document.getElementById(parentSkillDetailId).innerHTML = "";
          // document.getElementById("parent-" + parentSkillDetailId).click();
          if (skillDetail?.path_addr) {
            const elements = document.getElementsByClassName(
              skillDetail?.path_addr
            );
            console.log(elements, "ratedBtn");
            for (const element of elements) {
              element.innerHTML = `<i class="fa fa-check"></i> ${skillDetail?.name}`;
              element.classList.add(skillDetail?.path_addr, "selected-skills");
            }
          }
          createSelectedSkillsCount();
          displaySelctedSkills();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }
  //#####################   create a html rating model box   ############s###########
  changeRateModelElement(skillDetail, parentSkillDetailId) {
    console.log(skillDetail,"skillDetail");
    console.log(parentSkillDetailId,"parentSkillDetailId");
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
    closebutton.setAttribute("class", "btn btn-primary");
    closebutton.style.textTransform = "none";
    closebutton.style.background = "#007DFC";
    closebutton.style.fontSize = "inherit";
    closebutton.style.paddingRight="35px";
    closebutton.style.paddingLeft="35px";
    closebutton.style.paddingTop="7px";
    closebutton.style.paddingBottom="7px";
    closebutton.style.borderRadius = "6px";
    closebutton.style.marginRight="20px";
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
    button.style.paddingRight="35px";
    button.style.paddingLeft="35px";
    button.style.paddingTop="7px";
    button.style.paddingBottom="7px";
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
    if (objExist) {
      rateSkillCommentBox.value = objExist.comment;
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
  
  processRelatedSkills(htmlElement, skillList, identifier, skillId, isInitialLoad = true) {
    console.log("relatedskillId", skillId);
    const CardBody = document.createElement("div");

    if (skillList.length > 0) {
        if (isInitialLoad && skillList[0].name === "Related Skills" && skillList[0].path_addr) {
            const url = `${ENDPOINT_URL}get-recommendations/?path_addr=${skillList[0].path_addr}`;
            
            fetchData(url, "GET")
                .then((response) => {
                    if (response !== undefined) {
                        console.log("get-recommendations", response);

                        // Filter out skills with child_count equal to 1
                        const validRelatedSkills = response.filter(skill => skill.child_count !== 1);

                        if (validRelatedSkills.length > 0) {
                            const h5 = document.createElement("div");
                            h5.setAttribute("class", "card-title text-start");
                            h5.style.margin = "30px 10px";
                            h5.style.marginBottom="12px";
                            h5.textContent = skillList[0].name;

                            this.cardBodyDiv.appendChild(h5);

                            this.processRelatedSkills(
                                this.cardBodyDiv,
                                // validRelatedSkills,
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
            CardBody.style.padding = "30px";
            CardBody.classList.add("card-body-accordion");
            // CardBody.style.display = "flex";
            // CardBody.style.flexWrap = "wrap";
            CardBody.style.borderRadius="10px";
            CardBody.style.marginBottom="15px";
            CardBody.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.2)";

            // Pass the skillId correctly
            this.renderRelatedHardSkills(
                skillList,
                [],
                CardBody,
                skillId
            );

            // Append CardBody to the htmlElement
            htmlElement.appendChild(CardBody);
        }
    } else {
        CardBody.innerHTML = "";
        htmlElement.appendChild(CardBody);
    }
  }
  
  // createSelectSkillsChildBox(htmlElement, skillList, identifier, skillId, isInitialLoad = true) {
  //   console.log("HardskillId", skillId);
  //   const CardBody = document.createElement("div");
  
  //   if (skillList.length > 0) {
  //     if (isInitialLoad && skillList[0].name === "Related Skills" && skillList[0].path_addr) {
  //       const url = `${ENDPOINT_URL}get-recommendations/?path_addr=${skillList[0].path_addr}`;
        
  //       fetchData(url, "GET")
  //         .then((response) => {
  //           if (response !== undefined) {
  //             console.log("get-recommendations", response);
  
  //             // Filter out skills with child_count equal to 1
  //             const validRelatedSkills = response.filter(skill => skill.child_count !== 1);
  
  //             if (validRelatedSkills.length > 0) {
  //               const h5 = document.createElement("div");
  //               h5.setAttribute("class", "card-title text-start");
  //               h5.style.margin = "30px 0px";
  //               h5.textContent = "Related Skills";
  
  //               this.cardBodyDiv.appendChild(h5);
  
  //               this.createSelectSkillsChildBox(
  //                 this.cardBodyDiv,
  //                 validRelatedSkills,
  //                 "Related Skills",
  //                 skillId,
  //                 false // Pass false to indicate that this is not the initial load
  //               );
  //             }
  //           }
  //         })
  //         .catch((error) => {
  //           console.error(error);
  //         });
  //     } else {
  //       CardBody.style.backgroundColor = "white";
  //       CardBody.style.padding = "30px";
  //       CardBody.classList.add("card-body-accordion");
  //       CardBody.style.display="flex";
  //       CardBody.style.flexWrap="wrap";
  //       CardBody.style.borderRadius="10px";
  //       CardBody.style.marginBottom="15px";
  //       CardBody.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  
  //       this.renderHardSkills(
  //         skillList,
  //         [],
  //         CardBody,
  //         skillId,
  //       );
  
  //       // Create the three buttons in the card-body using a parent div
  //       // const cardBodyButtonDiv = document.createElement("div");
  //       // const getdata = sortRatingByLocalStorage();
        
  //       // if (!identifier) {
  //       //   const button = document.createElement("button");
  //       //   const resetChangesButton = ResetButton(
  //       //     button,
  //       //     getdata?.length > 0 ? false : true
  //       //   );
  //       //   cardBodyButtonDiv.appendChild(resetChangesButton);
  //       // }
  
  //       // // Append buttons to the card body
  //       // CardBody.appendChild(cardBodyButtonDiv);
  //     }
  //   } else {
  //     CardBody.innerHTML = "";
  //   }
  
  //   htmlElement.appendChild(CardBody);
  // }

  async createSelectSkillsChildBox(htmlElement, skillList, identifier, skillId, isInitialLoad = true) {
    console.log("HardskillId", skillId);

    if (skillList.length > 0) {
        if (isInitialLoad && skillList[0].name === "Related Skills" && skillList[0].path_addr) {
            const url = `${ENDPOINT_URL}get-recommendations/?path_addr=${skillList[0].path_addr}`;

            try {
                const response = await fetchData(url, "GET");
                if (response !== undefined) {
                    console.log("get-recommendations", response);

                    // Filter out skills with child_count equal to 1
                    const validRelatedSkills = response.filter(skill => skill.child_count !== 1);

                    if (validRelatedSkills.length > 0) {
                        const h5 = document.createElement("div");
                        h5.setAttribute("class", "card-title text-start");
                        h5.style.margin = "30px 0px";
                        h5.textContent = "Related Skills";

                        this.cardBodyDiv.appendChild(h5);

                        await this.createSelectSkillsChildBox(
                            this.cardBodyDiv,
                            validRelatedSkills,
                            "Related Skills",
                            skillId,
                            false // Pass false to indicate that this is not the initial load
                        );
                    }
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            const skillsWithTwoTags = skillList.filter(skill => skill.tags.length === 2);
            const otherSkills = skillList.filter(skill => skill.tags.length !== 2);
            console.log(skillsWithTwoTags);

            // Create a separate CardBody for other skills
            if (otherSkills.length > 0) {
                const otherSkillsCardBody = document.createElement("div");
                otherSkillsCardBody.style.backgroundColor = "white";
                otherSkillsCardBody.style.padding = "30px";
                otherSkillsCardBody.classList.add("card-body-accordion");
                // otherSkillsCardBody.style.display = "flex";
                // otherSkillsCardBody.style.flexWrap = "wrap";
                otherSkillsCardBody.style.borderRadius = "10px";
                otherSkillsCardBody.style.marginBottom = "15px";
                otherSkillsCardBody.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

                this.renderHardSkills(
                    otherSkills,
                    [],
                    otherSkillsCardBody,
                    skillId,
                    otherSkills,
                    otherSkills[0].tags[0].title
                );

                // Append the CardBody for other skills to the htmlElement
                htmlElement.appendChild(otherSkillsCardBody);
            }

            // Group skills with two tags by their secondary tag
            const groupedBySecondaryTag = {};
            skillsWithTwoTags.forEach(skill => {
                const secondaryTag = skill.tags.find(tag => tag.title !== "Skills Category").title;
                if (!groupedBySecondaryTag[secondaryTag]) {
                    groupedBySecondaryTag[secondaryTag] = [];
                }
                groupedBySecondaryTag[secondaryTag].push(skill);
            });

            // Create a separate CardBody for each group of skills with two tags
            for (const [secondaryTag, skills] of Object.entries(groupedBySecondaryTag)) {
                console.log(skills);
                const twoTagsCardBody = document.createElement("div");
                twoTagsCardBody.style.backgroundColor = "white";
                twoTagsCardBody.style.padding = "30px";
                twoTagsCardBody.classList.add("card-body-accordion");
                // twoTagsCardBody.style.display = "flex";
                // twoTagsCardBody.style.flexWrap = "wrap";
                twoTagsCardBody.style.borderRadius = "10px";
                twoTagsCardBody.style.marginBottom = "15px";
                twoTagsCardBody.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

                // Fetch and render child skills for each skill in this group
                for (const skill of skills) {
                    const h5 = document.createElement("div");
                    h5.setAttribute("class", "card-title text-start");
                    h5.style.margin = "30px 10px";
                    h5.style.marginBottom = "12px";
                    h5.textContent = skill.name;
                    htmlElement.appendChild(h5);
                    if (skill.child_count > 0) {
                        const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
                        const childSkills = await fetchData(childSkillApiEndpoint, "GET");
                        if (childSkills && childSkills.length > 0) {
                            this.renderHardSkills(
                                childSkills,
                                [],
                                twoTagsCardBody,
                                skill.path_addr,
                                childSkills,
                                skill.name
                            );
                        }
                    }
                }

                // Append the CardBody for skills with two tags to the htmlElement
                htmlElement.appendChild(twoTagsCardBody);
            }

        }
    } else {
        htmlElement.innerHTML = "";
    }
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
      if(skill.ratings && skill.ratings.length > 0) {
        console.log(skill);
        const searchText = searchByName(skill.name);
        if (searchText.length > 0) {
          const starIcon = document.createElement("img");
          starIcon.src = `${imagePath}Group 23.svg`;
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          li.style="background-color:#E0DEFF; padding-right:16px; padding-left:16px; padding-top:4px; padding-bottom:4px; border-radius:7px; box-shadow:rgba(0,0,0,0.1) 0px 2px 8px;";
          li.appendChild(starIcon);
        }
        else{
          const starIcon = document.createElement("i");
          starIcon.className = "fas fa-star";
          starIcon.style.marginLeft = "5px";
          starIcon.style.cursor = "pointer";
          starIcon.style.color = "#ccccff";
          li.style="background-color:white; padding-right:16px; padding-left:16px; padding-top:4px; padding-bottom:4px; border-radius:7px; box-shadow:rgba(0,0,0,0.1) 0px 2px 8px;";
          li.appendChild(starIcon);
        }
      } 
      skills=skill;
    });
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "breadcrumb");
    nav.setAttribute("class", "breadcrumb-nav");
    nav.setAttribute("id",skills.path_addr)
    // nav.style.cursor="pointer";
    nav.appendChild(ol);
    nav.addEventListener("click",()=>{
      console.log(skills,"skills");
      this.changeRateModelElement(skills);
    })
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
        spanSliderInnerDiv.style= "border-bottom:2px solid #E9EDF1 !important; display:flex !important;";
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
          // Creating radio buttons
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
        
            if (objExist) {
                // check if the rating already exists
                objExist.rating.forEach((obj) => {
                    if (obj.isot_rating_id === sliderObj._id) {
                        if (obj.rating === index + 1) {
                            checkboxInput.checked = true;
                        }
                    }
                });
            }
            //To select the one checkbox at the time
            checkboxInput.addEventListener("change", () => {
              if (checkboxInput.checked) {
                  const checkboxes = document.getElementsByName(`${sliderObj._id}`);
                  checkboxes.forEach((checkbox) => {
                      if (checkbox !== checkboxInput) {
                          checkbox.checked = false;
                      }
                  });
              }
            });
          });        
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
            spanSliderInnerDiv,
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
      sliderHandleConnects.style.borderRadius = "10px";
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
      sliderHandle.style.background = "#007DFC";
      sliderHandle.style.border = "5px solid white";
      sliderHandle.style.borderRadius = "50%";
      sliderHandle.style.content = "none";
      var nouiHorizontalSliderHeight = document.createElement("style");

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
            `spanElementForStar-${sliderObj._id}`,
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
        parentSkillDetailId,
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

  createSkillSelectBox(skillDetail, identifier) {
    const skillDetailArray = JSON.parse(sessionStorage.getItem("items"));
    this.searchInputBox.value =
      skillDetailArray !== null ? skillDetailArray[0].name : skillDetail.term;
    this.selectedASkillBox.innerHTML = "";
    const cardDiv = document.createElement("div");
    document.getElementById("replaceholder").innerHTML = "";
    cardDiv.classList.add("card");
    const cardBodyDiv = document.createElement("div");
    // cardBodyDiv.style.backgroundColor="#EFF4FA";
    cardBodyDiv.classList.add("card-body");
    cardBodyDiv.style="padding-left:20px; padding-right:20px; padding-top:15px; padding-bottom:5px; background-color:#EFF4FA; border-radius:5px;";
    cardBodyDiv.id = "card-body-accordion";
    const cardTitleH4 = document.createElement("h4");
    cardTitleH4.classList.add("card-title");
    cardTitleH4.style="display: flex; margin-top: 10px; margin-bottom: 20px;";
    const skillButton = document.createElement("button");
    skillButton.className = "softskillbutton";
    skillButton.setAttribute("id","softskillbutton");
    skillButton.style.border = "1px solid rgb(230, 230, 230)";
    skillButton.style.borderRadius = "10px";
    skillButton.style.margin = "5px";
    skillButton.style.padding = "8px 12px";
    skillButton.style.backgroundColor = "#FFFFFF";
    skillButton.style.cursor = "pointer";
    skillButton.style.color = "#1E1E1E";
    skillButton.style.fontSize = "16px";
    skillButton.setAttribute("data-mdb-tooltip-init", "");
    const buttonContentDiv = document.createElement("div")
    buttonContentDiv.style="display:flex; align-items:center; justify-content:center;";
    const skillNameSpan = document.createElement("span");
    skillNameSpan.textContent = skillDetail.skills[0].name;
    const description = skillDetail.skills[0].description;
    const ratingsCount = skillDetail.skills[0].ratings ? skillDetail.skills[0].ratings.length : 0;
    if (skillDetail.skills[0].proxy_skill) {
      manageTooltip(skillNameSpan,skillDetail.skills[0].proxy_skill.name);
    }
    else if (skillDetail.skills[0].name.length > 30) {
      skillNameSpan.classList.add("truncate");
      manageTooltip(skillNameSpan,skillDetail.skills[0].name);
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
      manageTooltip(descriptionImg,description);
    }
    
    buttonContentDiv.appendChild(skillNameSpan);

    if (ratingsCount > 0) {
      const searchText = searchByName(skillDetail.skills[0].name);
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
        const starIcon = document.createElement("i");
        starIcon.setAttribute("id",skillDetail.skills[0].path_addr)
        starIcon.className = "fas fa-star";
        starIcon.style.marginLeft = "5px";
        starIcon.style.cursor = "pointer";
        starIcon.style.color = "#ccccff";
        starIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            this.changeRateModelElement(skillDetail.skills[0]);
        });
        buttonContentDiv.appendChild(starIcon);
        if(searchText.length>0){
          skillButton.style.backgroundColor="#E0DEFF";
          starIcon.style.color="#4682B4";
        }
      // }
    }
    skillButton.appendChild(buttonContentDiv);
    this.cardBodyDiv = cardBodyDiv;
    cardTitleH4.appendChild(skillButton);
    cardBodyDiv.appendChild(cardTitleH4);
    // this.createSkillPath(this.cardBodyDiv, getListFromsessionStorage());
    if (skillDetail?.skills?.length > 0) {
      skillDetail.skills.forEach((skill) => {
        // clearsessionStorage();
        this.treeSkillAPI(cardBodyDiv, skill.path_addr);
        // this.createSkillPath(cardBodyDiv, getListFromsessionStorage());
      });
    } else {
        console.log("entered parent skill");
      this.childrenSkillAPI(skillDetail.path_addr, identifier);
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
  
  appendQuickViewContent() {
    const skillsData = getListFromlocalStorage(); // Assuming this  retrieves the skills data

    if (!skillsData || skillsData.length === 0) {
      document.getElementById("quickViewContentDiv").innerHTML =
        "<br>No skills data available.";
      return;
    }
    // Group skills based on tags
    const groupedSkills = {};
    skillsData.forEach((skill, index) => {
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
        skillContainer.className =
          "d-flex align-items-center gap-2 px-2";
        skillContainer.style="font-size:14px; background-color:#F6F7F9; border-radius:10px;"
        // skillContainer.style.fontSize = "14px";
        skillContainer.style.padding = "4px 0px";

        const skillName = document.createElement("span");
        if(skill.isot_file.proxy_skill && skill.isot_file.proxy_skill.name){
          skillName.innerHTML = skill.isot_file.proxy_skill.name;
        }
        else{
          skillName.innerHTML = skill.isot_file.name;
        }
        skillName.style="font-size:16px; color:#1E1E1E";
        var percentage;
        if(skill.rating.length==2){
          percentage = ((skill.rating[1].rating - 1) / skill.isot_file.ratings[1].rating_scale_label.length) * 100;
        }
        else{
          percentage = ((skill.rating[0].rating - 1) / skill.isot_file.ratings[0].rating_scale_label.length) * 100;
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

        if (percentage === 0) {
          const image0 = document.createElement("img");
          image0.src = imagePathBase + '0rate.png';
          image0.style.width = '30px';
          image0.style.height = '30px';
          image0.style.margin = 'auto';
          image0.style.display = 'block';
          if(iysplugin.doughnt){
            skillContainer.appendChild(image0);
          }
        }
        if (percentage === 25) {
          const image25 = document.createElement("img");
          image25.src = imagePathBase + '25.png';
          image25.style.width = '30px';
          image25.style.height = '30px';
          image25.style.margin = 'auto';
          image25.style.display = 'block';
          if(iysplugin.doughnt){
            skillContainer.appendChild(image25);
          }
        }
        if (percentage === 50) {
            const image50 = document.createElement("img");
            image50.src = imagePathBase + '50.png';
            image50.style.width = '30px';
            image50.style.height = '30px';
            image50.style.margin = 'auto';
            image50.style.display = 'block';
            if(iysplugin.doughnt){
              skillContainer.appendChild(image50);
            }
        }
        if (percentage === 75) {
            const image75 = document.createElement("img");
            image75.src = imagePathBase + '75.png';
            image75.style.width = '30px';
            image75.style.height = '30px';
            image75.style.margin = 'auto';
            image75.style.display = 'block';
            if(iysplugin.doughnt){
              skillContainer.appendChild(image75);
            }
        }
        if (percentage === 100) {
            const image100 = document.createElement("img");
            image100.src = imagePathBase + '100.png';
            image100.style.width = '30px';
            image100.style.height = '30px';
            image100.style.margin = 'auto';
            image100.style.display = 'block';
            if(iysplugin.doughnt){
              skillContainer.appendChild(image100);
            }
        }
        skillContainer.appendChild(skillName);
        //comments is present to show the comment
        if (skill.comment) {
          const commentImage = document.createElement("img");
          commentImage.src = `${imagePath}Group 148.svg`;
          commentImage.className = "comment-image ms-1";
          commentImage.title=skill.comment;
          commentImage.style.cursor = "pointer";
          commentImage.style.position = "relative";
          skillContainer.appendChild(commentImage);
        }
        const deleteIcon = document.createElement("img");
        deleteIcon.src = `${imagePath}Group 34.svg`;
        deleteIcon.style="height:14px; width: 12px;"
        deleteIcon.setAttribute("data-mdb-tooltip-init", "");
        deleteIcon.style.backgroundColor = "#EEEEEE";
        deleteIcon.setAttribute("title", "Click to Delete");
        if(iysplugin.isDelete)
        {
          skillContainer.appendChild(deleteIcon);
        }

        const editIcon = document.createElement("img");
        editIcon.src = `${imagePath}Group 35.svg`;
        editIcon.style="height:14px; width: 12px;"
        editIcon.style.backgroundColor = "#EEEEEE";
        editIcon.setAttribute("data-mdb-tooltip-init", "");
        editIcon.setAttribute("title", "Click to edit");
        editIcon.setAttribute("id",skill.isot_file.path_addr);

        if(iysplugin.isEdit){
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
          console.log("refess the connect", skill.index);

          this.deleteSkillsFromLocalStorage(skill.index);
          skillContainer.remove();

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
    skillsData.forEach((skill, index) => {
      const tagsString = this.getTags(skill.isot_file.tags);
      if (!groupedSkills[tagsString]) {
        groupedSkills[tagsString] = [];
      }
      groupedSkills[tagsString].push({ ...skill, index });
    });

    // Append content to tabularViewContentView
    const tabularViewContentDiv = document.getElementById(
      "tabularViewContentView"
    );
    const accordionContainer = document.createElement("div");
    accordionContainer.className = "accordion";
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
      tagTitle.innerText = tagsString +" -";
      tagTitle.style="color:#635BFF;";

      const skillsCount = document.createElement("span");
      skillsCount.innerText = `${skillsGroup.length} elements selected`;
      skillsCount.style="color:#9B9B9B;"

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
      accordionBody.style="padding-20px;"
      skillsGroup.forEach((skill, index) => {
        const skillContainer = document.createElement("div");
        skillContainer.className =
          "taggedSkills d-flex flex-wrap align-items-center justify-content-between gap-3 px-3";
        skillContainer.style="background-color:#F6F7F9; padding-top:5px; padding-bottom:5px;"
        const skillName = document.createElement("div");
        skillName.className = "bg-";
        const commentImageHTML = skill.comment
          ? `<img src="${imagePath}Group 148.svg" class="comment-image ms-1" style="cursor:pointer;">`
          : "";

        if (skill.isot_file.proxy_skill && skill.isot_file.proxy_skill.name) {
          skillName.innerHTML = `${skill.isot_file.proxy_skill.name} ${commentImageHTML}${
            getExpertiseLevel(skill.rating, skill.isot_file.ratings) || ""
          }` || "Skill Name Not Available";
        } else {
          skillName.innerHTML = `${skill.isot_file.name} ${commentImageHTML}${
            getExpertiseLevel(skill.rating, skill.isot_file.ratings) || ""
          }` || "Skill Name Not Available";
        }

        const skillDetails = document.createElement("div");
        skillDetails.className = "d-flex ";
        skillDetails.style.alignItems = "center";
        skillDetails.style.justifyContent = "center";

        const experienceDetails = document.createElement("div");
        experienceDetails.className = "px-3";

        const ratingValue = skill.rating.length === 2 ? skill.rating[1].rating - 1 : skill.rating[0].rating - 1;

        let ratingLabel = '';
        let showCalendarIcon = false;

        if (skill.rating.length === 2) {
            ratingLabel = skill.isot_file.ratings[1].rating_scale_label[ratingValue-1];
            showCalendarIcon = skill.isot_file.ratings[1].rating_category === "Experience Level";
        } else {
            ratingLabel = skill.isot_file.ratings[0].rating_scale_label[ratingValue-1];
            showCalendarIcon = skill.isot_file.ratings[0].rating_category === "Experience Level";
        }

        experienceDetails.innerHTML = showCalendarIcon 
            ? `<i class="fa fa-lg fa-calendar-days me-1 text-primary"></i> ${ratingLabel}`
            : `${ratingLabel}`;

        // const ratingDetails = document.createElement("div");
        // ratingDetails.className = "ps-3 border-end border-2  px-2";
        // ratingDetails.innerText = `${skill.rating[0].rating}/${skill.isot_file.ratings[0].rating_scale_label.length} Rating`;
        var percentage;
        if(skill.rating.length == 2){
          percentage = ((skill.rating[1].rating - 1) / skill.isot_file.ratings[1].rating_scale_label.length) * 100;
        }
        else{
          percentage = ((skill.rating[0].rating - 1) / skill.isot_file.ratings[0].rating_scale_label.length) * 100;
        }

        const imagePathBase = imagePath;

        const ratingDetails = document.createElement("div");
        ratingDetails.className = "ps-3  px-2";

        if (percentage === 0) {
          const image0 = document.createElement("img");
          image0.src = imagePathBase + '0rate.png';
          image0.style.width = '40px';
          image0.style.height = '40px';
          image0.style.margin = 'auto';
          image0.style.display = 'block';
          ratingDetails.appendChild(image0);
        }
        if (percentage === 25) {
          const image25 = document.createElement("img");
          image25.src = imagePathBase + '25.png';
          image25.style.width = '40px';
          image25.style.height = '40px';
          image25.style.margin = 'auto';
          image25.style.display = 'block';
          ratingDetails.appendChild(image25);
        }
        if (percentage === 50) {
            const image50 = document.createElement("img");
            image50.src = imagePathBase + '50.png';
            image50.style.width = '40px';
            image50.style.height = '40px';
            image50.style.margin = 'auto';
            image50.style.display = 'block';
            ratingDetails.appendChild(image50);
        }
        if (percentage === 75) {
            const image75 = document.createElement("img");
            image75.src = imagePathBase + '75.png';
            image75.style.width = '40px';
            image75.style.height = '40px';
            image75.style.margin = 'auto';
            image75.style.display = 'block';
            ratingDetails.appendChild(image75);
        }
        if (percentage === 100) {
            const image100 = document.createElement("img");
            image100.src = imagePathBase + '100.png';
            image100.style.width = '40px';
            image100.style.height = '40px';
            image100.style.margin = 'auto';
            image100.style.display = 'block';
            ratingDetails.appendChild(image100);
        }

        const actionsIconDiv = document.createElement("div");
        actionsIconDiv.className = "ps-3";
        const deleteIcon = document.createElement("img");
        deleteIcon.src = `${imagePath}Group 34.svg`;
        deleteIcon.style="margin-right:10px !important; height:16px; width: 14px;";
        deleteIcon.style.backgroundColor = "#EEEEEE";
        deleteIcon.setAttribute("data-mdb-tooltip-init", "");
        deleteIcon.setAttribute("title", "Click to Delete");
        if(iysplugin.isDelete){
          actionsIconDiv.appendChild(deleteIcon);
        }

        const editIcon = document.createElement("img");
        editIcon.src = `${imagePath}Group 35.svg`;
        editIcon.style="height:16px; width: 14px;"
        editIcon.setAttribute("data-mdb-tooltip-init", "");
        editIcon.setAttribute("title", "Click to edit");
        editIcon.setAttribute("id",skill.isot_file.path_addr);
        editIcon.style.backgroundColor = "#EEEEEE";
        if(iysplugin.isEdit){
          actionsIconDiv.appendChild(editIcon);
        }

        if (skill.rating[0].rating) {
          if(iysplugin.experience){
            skillDetails.appendChild(experienceDetails);
          }
          if(iysplugin.doughnt){
            skillDetails.appendChild(ratingDetails);
          }
        }
        skillDetails.appendChild(actionsIconDiv);

        const commentDiv = document.createElement("div");
        commentDiv.className = "comment-div mb-1";
        commentDiv.style.display = "none";
        commentDiv.style.width = "100%";
        commentDiv.style.padding = "5px 10px";
        commentDiv.style.backgroundColor="#FF6692";
        commentDiv.style.color="#F6F7F9";
        commentDiv.innerHTML = skill.comment;

        // Add event listener to toggle comment visibility
        if (skill.comment) {
          skillName.querySelector('.comment-image').addEventListener('click', () => {
            commentDiv.style.display = commentDiv.style.display === "none" ? "block" : "none";
          });
        }

        skillContainer.appendChild(skillName);
        skillContainer.appendChild(skillDetails);
        skillContainer.appendChild(commentDiv);
        // skillContainer.appendChild(deleteIcon);

        deleteIcon.addEventListener("click", () => {
          console.log("delete the skill", skill);
          // delete_skill(skill.id);
          console.log("refess the connect", skill.index);

          this.deleteSkillsFromLocalStorage(skill.index);
          skillContainer.remove();
          this.updateProfileData();

          // this.createListProfileSkills();
        });

        editIcon.addEventListener("click", () => {
          console.log("editing things", skill.isot_file);

          this.changeRateModelElement(skill.isot_file);
          // console.log("delete the skill", skill);
          // // delete_skill(skill.id);
          // console.log("refess the connect", skill.index);

          // this.createListProfileSkills();
        });

        // Check if the skill container is the last child
        if (index == 0) {
          skillContainer.classList.add("mt-0");
        } else {
          skillContainer.classList.add("mt-3"); // No border-bottom for the last child
        }

        accordionBody.appendChild(skillContainer);
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
      url = window.location.origin + "/api-child/?path_addr=" + skillId;
    } else {
      url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
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

  deleteSkillsFromLocalStorage(index) {
    if(!isLoginUser){
        let userRatedSkills = JSON.parse(
            localStorage.getItem("userRatedSkills", "[]")
          );
          // delete the skills by index
          userRatedSkills.splice(index, 1);
          localStorage.setItem("userRatedSkills", JSON.stringify(userRatedSkills));
          this.updateProfileData();
    }
    else{
        let userRatedSkills = getListFromlocalStorage();
        // delete the skills by index
        if (localStorage.getItem("logginUserRatedSkills")) {
            let removedElement = userRatedSkills.splice(index, 1);
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
                // Redirect to /limit-exceeded/ page
                window.location.href = "/limit-exceeded/";
            } else {
                return response.json();
            }
            })
            .then(async (response) => {
            console.log("response", response);
            localStorage.setItem(
                "logginUserRatedSkills",
                JSON.stringify(userRatedSkills),
            );
            this.updateProfileData();
            });
        } else {
            userRatedSkills.splice(index, 1);
            localStorage.setItem("userRatedSkills", JSON.stringify(userRatedSkills));
        }
        this.updateProfileData();
    }
  }

  childrenSkillAPI(skillId, identifier, parentIdOfHirarchy = "") {
    // Get the element with the class ".card-body"
    const skillIdElement = document.getElementById(
      parentIdOfHirarchy !== "" ? parentIdOfHirarchy : skillId
    );
    const selectedSkillDiv = document.querySelector(".card-title");
    console.log(
      skillId,
      identifier,
      "skillIdElement",
      skillIdElement,
      parentIdOfHirarchy
    );
    const loader = document.createElement("div");
    loader.className = "loader";
    loader.style.margin = "100px auto";

    // Check if the element exists
    if (skillIdElement) {
      const previousContent = skillIdElement.innerHTML;
      // Create and append the loader
      skillIdElement.appendChild(loader);

      let url = "";
      if (isLoginUser) {
        url = `https://api.myskillsplus.com/api-child/?path_addr=${skillId}`;
      } else {
        url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
      }

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
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {

          skillIdElement.removeChild(loader);
          skillIdElement.innerHTML = previousContent;

            const relatedSkills = response.filter(item => item.name === "Related Skills");
            console.log(relatedSkills,"relatedskills");
            const childrenSkills = response.filter(item => item.name !== "Related Skills");
            console.log(childrenSkills,"childrenSkills");

            if (relatedSkills.length > 0) {
              const relatedSkillId = relatedSkills[0].path_addr;
                this.processRelatedSkills(
                    this.cardBodyDiv,
                    relatedSkills,
                    identifier,
                    relatedSkillId
                );
            }

            if (childrenSkills.length > 0) {
                this.createSelectSkillsChildBox(
                    this.cardBodyDiv,
                    childrenSkills,
                    identifier,
                    skillId
                );
            }
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
      selectedSkillDiv.appendChild(loader);
      let url = "";
      if (isLoginUser) {
        url = `https://api.myskillsplus.com/api-child/?path_addr=${skillId}`;
      } else {
        url = `${ENDPOINT_URL}children/?path_addr=${skillId}`;
      }

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
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
            selectedSkillDiv.removeChild(loader);
            selectedSkillDiv.innerHTML = previousContent;

            const relatedSkills = response.filter(item => item.name === "Related Skills");
            console.log(relatedSkills,"relatedskills");
            const childrenSkills = response.filter(item => item.name !== "Related Skills");
            console.log(childrenSkills,"childrenSkills");

            if (relatedSkills.length > 0) {
                const relatedSkillId = relatedSkills[0].path_addr;
                console.log(relatedSkillId,"relatedskillId");
                this.processRelatedSkills(
                    this.cardBodyDiv,
                    relatedSkills,
                    identifier,
                    relatedSkillId,
                );
            }

            if (childrenSkills.length > 0) {
                this.createSelectSkillsChildBox(
                    this.cardBodyDiv,
                    childrenSkills,
                    identifier,
                    skillId
                );
            }
        })
        .catch((err) => {
            selectedSkillDiv.removeChild(loader);
            selectedSkillDiv.innerHTML = previousContent;
            console.error(err);
        });
    }
  }

  updateProfileData() {
    this.appendQuickViewContent();

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
    return tags.map((tag) => tag.title).join(", ");
  }

  treeSkillAPI(cardBodyDiv, skillId) {
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
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          // this.createSkillPath(cardBodyDiv, response.ancestors);
          if (response.siblings.length > 0) {
            this.createSelectSkillsChildBox(
              this.cardBodyDiv,
              response.siblings
            );
          } else {
            this.childrenSkillAPI(skillId);
          }
          // setTimeout(() => {
          //   document.getElementById(skillId).click();
          // }, 3000);
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
            window.location.href = "/limit-exceeded/";
          } else {
            return response.json();
          }
        })
        .then((response) => {
          // this.createSkillPath(cardBodyDiv, response.ancestors);FromlocalStorage
          if (response.siblings.length > 0) {
            this.createSelectSkillsChildBox(
              this.cardBodyDiv,
              response.siblings
            );
          } else {
            this.childrenSkillAPI(skillId);
          }
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
    var softSkillDescription=$(".softSkillDescription");
    var softSkillDetail = $(".softskillaccordian");
    var roleDetail = $(".roleaccordian");
    imgBodyDiv.css("display", "none");
    cardBodyDetail.css("display", "");
    softSkillDescription.css("display", "none");
    softSkillDetail.css("display", "none");
    roleDetail.css("display", "none");
  }

    async handleRoleClick() {
        console.log("role clicked");
        var imgBodyDiv = $(".img-body");
        var cardBodyDetail = $(".card-body");
        var softSkillDescription=$(".softSkillDescription");
        var softSkillDetail = $(".softskillaccordian");
        var roleDetail = $(".roleaccordian");

        imgBodyDiv.css("display", "none");
        cardBodyDetail.css("display", "none");
        softSkillDescription.css("display", "none");
        softSkillDetail.css("display", "none");
        roleDetail.css("display", "");

        var roleaccordian = document.getElementById('roleaccordian');
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
        var softSkillDescription=$(".softSkillDescription");
        var softSkillDetail = $(".softskillaccordian");
        var roleDetail = $(".roleaccordian");

        imgBodyDiv.css("display", "none");
        cardBodyDetail.css("display", "none");
        softSkillDescription.css("display","");
        softSkillDetail.css("display", "");
        roleDetail.css("display", "none");

        var softskillaccordian = document.getElementById('softskillaccordian');

        if (softskillaccordian) {
            // if (softskillaccordian.children.length === 0) {
            await this.fetchParentSoftSkills(softskillaccordian);
            // }
        } else {
            console.error('Element with ID "softskillaccordian" not found.');
        }
    }

    async fetchParentSoftSkills(softSkillAccordian) {
        const parentSkillApiEndpoint = `${ENDPOINT_URL}soft-skills/`;

        try {
            const response = await fetch(parentSkillApiEndpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch parent soft skills');
            }
            const parentSkills = await response.json();

            // Render parent skill buttons
            this.renderSkills(parentSkills, [], softSkillAccordian);

        } catch (error) {
            console.error('Error fetching parent soft skills:', error);
        }
    }

    async fetchParentRoleSkills(softSkillAccordian) {
        const parentSkillApiEndpoint = `${ENDPOINT_URL}role/`;

        try {
            const response = await fetch(parentSkillApiEndpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch parent soft skills');
            }
            const parentSkills = await response.json();

            // Render parent skill buttons
            this.renderSkills(parentSkills, [], softSkillAccordian);

        } catch (error) {
            console.error('Error fetching parent soft skills:', error);
        }
    }

    async fetchSkills(apiEndpoint) {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch skills');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    }

    renderSkills(skills, breadcrumbPath, softSkillAccordian) {
      if (!softSkillAccordian) {
          console.error('softSkillAccordian element is not defined.');
          return;
      }
  
      // Clear existing content in softSkillAccordian before appending new content
      softSkillAccordian.innerHTML = '';
  
      // Render breadcrumb
      this.renderBreadcrumb(skills, breadcrumbPath, softSkillAccordian);
  
      // Create buttons for each skill
      const skillsContainer = document.createElement("div");
      skillsContainer.classList.add("softskillparentaccordian");
      skillsContainer.setAttribute("id", "softskillparentaccordian");
      skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
  
      skills.forEach(skill => {
          const skillButton = document.createElement("button");
          skillButton.className = "softskillbutton";
          skillButton.setAttribute("id","softskillbutton");
          skillButton.style.border = "1px solid rgb(230, 230, 230)";
          skillButton.style.borderRadius = "10px";
          skillButton.style.margin = "5px";
          skillButton.style.padding = "6px 12px";
          skillButton.style.backgroundColor = "#FFFFFF";
          skillButton.style.cursor = "pointer";
          skillButton.style.color = "#1E1E1E";
          skillButton.style.fontSize = "16px";
          skillButton.setAttribute("data-mdb-tooltip-init", "");
  
          const childCount = skill.child_count || 0;
          const ratingsCount = skill.ratings ? skill.ratings.length : 0;
          const description = skill.description;
  
          const buttonContentDiv = document.createElement("div")
          buttonContentDiv.style="display:flex; align-items:center; justify-content:center;";

          const skillNameSpan = document.createElement("span");
          skillNameSpan.textContent = skill.name;
          if (skill.proxy_skill) {
            manageTooltip(skillNameSpan,skill.proxy_skill.name);
          }
          else if (skill.name.length > 30) {
            skillNameSpan.classList.add("truncate");
            manageTooltip(skillNameSpan,skill.name);
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
            manageTooltip(descriptionImg,description);
          }

          buttonContentDiv.appendChild(skillNameSpan);

          if (childCount > 0) {
              const hoverCircleImg = document.createElement("img");
              hoverCircleImg.src = `${imagePath}hovercircle.png`;
              hoverCircleImg.alt = "circle";
              hoverCircleImg.style.width = "22px";
              hoverCircleImg.style.height = "22px";
              var tooltip =`${childCount} sub categories` ;
              // hoverCircleImg.title = `${childCount} sub categories`;
              hoverCircleImg.style.marginLeft = "10px";
              buttonContentDiv.appendChild(hoverCircleImg);
              manageTooltip(hoverCircleImg,tooltip);
          }

          if (ratingsCount > 0) {
            const searchText = searchByName(skill.name);
            if (searchText.length > 0) {
              const starIcon = document.createElement("img");
              starIcon.src = `${imagePath}Group 23.svg`;
              starIcon.style.marginLeft = "5px";
              starIcon.style.cursor = "pointer";
              starIcon.addEventListener('click', (event) => {
                  event.stopPropagation();
                  this.changeRateModelElement(skill);
              });
              skillButton.style.backgroundColor="#E0DEFF";
              buttonContentDiv.appendChild(starIcon);
            }
            else{
              const starIcon = document.createElement("i");
              starIcon.setAttribute("id",skill.path_addr)
              starIcon.className = "fas fa-star";
              starIcon.style.marginLeft = "5px";
              starIcon.style.cursor = "pointer";
              starIcon.style.color = "#ccccff";
              starIcon.addEventListener('click', (event) => {
                  event.stopPropagation();
                  this.changeRateModelElement(skill);
              });
              buttonContentDiv.appendChild(starIcon);
            }
          }
  
          skillButton.appendChild(buttonContentDiv);

          // Add click event to fetch and display child skills or call changeratingmodelelement
          skillButton.addEventListener('click', async () => {
              if (skill.child_count === 0) {
                  // Call changeratingmodelelement function with skill data
                  this.changeRateModelElement(skill);
              } else {
                  const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
                  const childSkills = await this.fetchSkills(childSkillApiEndpoint);
                  const newBreadcrumbPath = [...breadcrumbPath, { name: skill.name, path_addr: skill.path_addr, ratings: skill.ratings }];
  
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
          console.error('softSkillAccordian element is not defined.');
          return;
      }
  
      // Create breadcrumb element
      const breadcrumb = document.createElement("div");
      breadcrumb.classList.add("breadcrumb");
      breadcrumb.style = "margin:15px; padding:10px; background-color:white; display:none; border-radius:5px;";
  
      if (breadcrumbPath.length > 0) {
          breadcrumb.style.display = "";
          const knowledgeLink = document.createElement("span");
          knowledgeLink.textContent = skills[0].tags[0].title;
          knowledgeLink.style.cursor = "pointer";
          knowledgeLink.style.color = "#A7A4DC";
          knowledgeLink.style.marginRight = "5px";
          knowledgeLink.addEventListener('click', async () => {
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
          breadcrumbLink.style.color = index === breadcrumbPath.length - 1 ? "#4F46FB" : "#A7A4DC";
          breadcrumbLink.style.marginRight = "5px";
  
          breadcrumbLink.addEventListener('click', async () => {
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
        if (currentBreadcrumbItem && currentBreadcrumbItem.ratings && currentBreadcrumbItem.ratings.length > 0) {
            var rateButton = document.createElement("button");
            rateButton.className = "ratebutton";
            rateButton.setAttribute("id",skills.path_addr);
            rateButton.style.marginLeft = "5px";
            rateButton.style = "padding-top:1px; padding-bottom: 1px; border:none; border-radius:5px;";
            rateButton.style.backgroundColor = "#E0DEFF";
            rateButton.style.cursor = "pointer";

            const rateButtonSpan = document.createElement("span");

            const searchText = searchByName(currentBreadcrumbItem.name);
            if(searchText.length > 0){
              rateButton.style.backgroundColor = "#E0DEFF";
              rateButtonSpan.textContent = "Rated";
              rateButtonSpan.style.color="#1E1E1E";
              const starIcon = document.createElement("img");
              starIcon.src = `${imagePath}Group 23.svg`;
              starIcon.style.marginRight = "5px";
              starIcon.style.cursor = "pointer";
              rateButton.appendChild(starIcon);
            }
            else{
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
  
    renderRelatedHardSkillBreadcrumb(skills, breadcrumbPath, softSkillAccordian, skillId) {
      if (!softSkillAccordian) {
          console.error('softSkillAccordian element is not defined.');
          return;
      }
  
      // Create breadcrumb element
      const breadcrumb = document.createElement("div");
      breadcrumb.classList.add("breadcrumb");
      breadcrumb.style = "margin:15px; padding:10px; background-color:white; display:none; border-radius:5px;";
  
      if (breadcrumbPath.length > 0) {
          breadcrumb.style.display = "";
          
          const knowledgeLink = document.createElement("span");
          knowledgeLink.textContent = "Related Skills";
          knowledgeLink.style.cursor = "pointer";
          knowledgeLink.style.color = "#A7A4DC";
          knowledgeLink.style.marginRight = "5px";
          knowledgeLink.addEventListener('click', async () => {
              const parentSkillApiEndpoint = `${ENDPOINT_URL}get-recommendations/?path_addr=${skillId}`;
              try {
                  const parentSkills = await this.fetchSkills(parentSkillApiEndpoint);
                  
                  // Filter out skills with child_count equal to 1
                  // const validParentSkills = parentSkills.filter(skill => skill.child_count !== 1);
          
                  this.renderRelatedHardSkills(parentSkills, [], softSkillAccordian, skillId);
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
          console.log('Skills:', skills);
          console.log('Breadcrumb Path:', breadcrumbPath);
          console.log('Clicked Skill Path:', clickedSkillPath);
  
          // Check if the clicked skill has ratings
          if (clickedSkill.ratings && clickedSkill.ratings.length > 0) {
              const rateButton = document.createElement("button");
              rateButton.className = "ratebutton";
              rateButton.setAttribute("id",clickedSkillPath);
              rateButton.style.marginLeft = "5px";
              rateButton.style.paddingTop = "1px";
              rateButton.style.paddingBottom = "1px";
              rateButton.style.border = "none";
              rateButton.style.borderRadius = "5px";
              rateButton.style.cursor = "pointer";
  
              const rateButtonSpan = document.createElement("span");

              const searchText = searchByName(clickedSkill.name);
              if(searchText.length > 0){
                rateButton.style.backgroundColor = "#E0DEFF";
                rateButtonSpan.textContent = "Rated";
                rateButtonSpan.style.color="#1E1E1E";
                const starIcon = document.createElement("img");
                starIcon.src = `${imagePath}Group 23.svg`;
                starIcon.style.marginRight = "5px";
                starIcon.style.cursor = "pointer";
                rateButton.appendChild(starIcon);
              }
              else{
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
                  console.log('Clicked Skill for Rating:', clickedSkill); // Debugging log
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
            console.error('softSkillAccordian element is not defined.');
            return;
        }
        softSkillAccordian.innerHTML = '';
    
        this.renderRelatedHardSkillBreadcrumb(skills, breadcrumbPath, softSkillAccordian, skillId);
    
        const skillsContainer = document.createElement("div");
        skillsContainer.classList.add("softskillparentaccordian");
        skillsContainer.setAttribute("id", "softskillparentaccordian");
        skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
        skillsContainer.style.textAlign = "left";
    
        skills.forEach(skill => {
            const skillButton = document.createElement("button");
            skillButton.className = "softskillbutton";
            skillButton.style.border = "2px solid rgb(230, 230, 230)";
            skillButton.style.borderRadius = "10px";
            skillButton.style.margin = "5px";
            skillButton.style.padding = "6px 12px";
            skillButton.style.backgroundColor = "#FFFFFF";
            skillButton.style.cursor = "pointer";
            skillButton.style.color = "#1E1E1E";
            skillButton.style.fontSize = "16px";
            skillButton.setAttribute("data-mdb-tooltip-init", "");
    
            const childCount = skill.child_count || 0;
            const ratingsCount = skill.ratings ? skill.ratings.length : 0;
            const description = skill.description;
            const buttonContentDiv = document.createElement("div")
            buttonContentDiv.style="display:flex; align-items:center; justify-content:center;";

            const skillNameSpan = document.createElement("span");
            skillNameSpan.textContent = skill.name;
            if (skill.proxy_skill) {
              manageTooltip(skillNameSpan,skill.proxy_skill.name);
            }
            else if (skill.name.length > 30) {
              skillNameSpan.classList.add("truncate");
              manageTooltip(skillNameSpan,skill.name);
            }

            if (description) {
              const descriptionImg = document.createElement("img");
              descriptionImg.src = `${imagePath}Group 27.svg`;
              descriptionImg.alt = "description";
              // descriptionImg.title = description;
              descriptionImg.style.marginRight = "10px";
              buttonContentDiv.appendChild(descriptionImg);
              manageTooltip(descriptionImg,description);
            }

            buttonContentDiv.appendChild(skillNameSpan);

            if (childCount > 1) {
                const hoverCircleImg = document.createElement("img");
                hoverCircleImg.src = `${imagePath}hovercircle.png`;
                hoverCircleImg.alt = "circle";
                hoverCircleImg.style.width = "22px";
                hoverCircleImg.style.height = "22px";
                var tooltip = `${childCount} sub categories`;
                // hoverCircleImg.title = `${childCount} sub categories`;
                hoverCircleImg.style.marginLeft = "10px";
                buttonContentDiv.appendChild(hoverCircleImg);
                manageTooltip(hoverCircleImg,tooltip);
            }

            if (ratingsCount > 0) {
              const searchText = searchByName(skill.name);
              if (searchText.length > 0) {
                const starIcon = document.createElement("img");
                starIcon.src = `${imagePath}Group 23.svg`;
                starIcon.style.marginLeft = "5px";
                starIcon.style.cursor = "pointer";
                starIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.changeRateModelElement(skill);
                });
                buttonContentDiv.appendChild(starIcon);
                skillButton.style.backgroundColor="#E0DEFF";
              }
              else{
                const starIcon = document.createElement("i");
                starIcon.className = "fas fa-star";
                starIcon.setAttribute("id",skill.path_addr)
                starIcon.style.marginLeft = "5px";
                starIcon.style.cursor = "pointer";
                starIcon.style.color = "#ccccff";
                starIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.changeRateModelElement(skill);
                });
                buttonContentDiv.appendChild(starIcon);
              }
            }
            skillButton.appendChild(buttonContentDiv);
            // Add click event to fetch and display child skills or call changeRateModelElement
            skillButton.addEventListener('click', async () => {
                if (skill.child_count === 1 || skill.child_count === 0) {
                    console.log("zeroskill-data", skill);
                    this.changeRateModelElement(skill);
                } else {
                    const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
                    const childSkills = await this.fetchSkills(childSkillApiEndpoint);
                    const validParentSkills = childSkills.filter(skill => skill.name !== "Related Skills");
                    console.log(validParentSkills);
                    const newBreadcrumbPath = [...breadcrumbPath, { name: skill.name, path_addr: skill.path_addr, ratings: skill.ratings }];
                    console.log(newBreadcrumbPath, "breadcrumb");
                    this.renderRelatedHardSkills(validParentSkills, newBreadcrumbPath, softSkillAccordian, skillId);
                }
            });

            skillsContainer.appendChild(skillButton);
        });
        softSkillAccordian.appendChild(skillsContainer);
    }
  
    renderHardSkillBreadcrumb(skills, breadcrumbPath, softSkillAccordian, skillId, parentskills,skillName) {
      console.log(skillId);
      const hardSkillId = skillId;
      if (!softSkillAccordian) {
          console.error('softSkillAccordian element is not defined.');
          return;
      }
  
      // Create breadcrumb element
      const breadcrumb = document.createElement("div");
      breadcrumb.classList.add("breadcrumb");
      breadcrumb.style = "margin:15px; padding:10px; background-color:white; display:none; border-radius:5px;";
  
      if (breadcrumbPath.length > 0) {
          breadcrumb.style.display = "";

          const knowledgeLink = document.createElement("span");
          knowledgeLink.textContent = skillName;
          knowledgeLink.style.cursor = "pointer";
          knowledgeLink.style.color = "#A7A4DC";
          knowledgeLink.style.marginRight = "5px";
          knowledgeLink.addEventListener('click', async () => {
              console.log(skillId); // Ensure skillId is logged correctly
              const parentSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${hardSkillId}`; // Use hardSkillId consistently
              const parentSkills = await this.fetchSkills(parentSkillApiEndpoint);
              const filterSkills = parentSkills.filter(item => item.name !== "Related Skills");
              this.renderHardSkills(parentskills, [], softSkillAccordian, skillId, parentskills,skillName);
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
          breadcrumbLink.style.color = index === breadcrumbPath.length - 1 ? "#4F46FB" : "#A7A4DC";
          breadcrumbLink.style.marginRight = "5px";
  
          breadcrumbLink.addEventListener('click', async () => {
              const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${breadcrumbItem.path_addr}`;
              const skills = await this.fetchSkills(childSkillApiEndpoint);
              const childrenSkills = skills.filter(item => item.name !== "Related Skills");
              console.log(childrenSkills, "childrenSkills");
          
              const newBreadcrumbPath = breadcrumbPath.slice(0, index + 1);
              this.renderHardSkills(childrenSkills, newBreadcrumbPath, softSkillAccordian, skillId, parentskills);
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
      if (currentBreadcrumbItem && currentBreadcrumbItem.ratings && currentBreadcrumbItem.ratings.length > 0) {
          const rateButton = document.createElement("button");
          rateButton.className = "ratebutton";
          rateButton.setAttribute("id",currentBreadcrumbItem.path_addr);
          rateButton.style.marginLeft = "5px";
          rateButton.style.paddingTop = "1px";
          rateButton.style.paddingBottom = "1px";
          rateButton.style.border = "none";
          rateButton.style.borderRadius = "5px";
          rateButton.style.backgroundColor = "#E0DEFF";
          rateButton.style.cursor = "pointer";
  
          const rateButtonSpan = document.createElement("span");

          const searchText = searchByName(currentBreadcrumbItem.name);

          if(searchText.length > 0){
            rateButton.style.backgroundColor = "#E0DEFF";
            rateButtonSpan.textContent = "Rated";
            rateButtonSpan.style.color="#1E1E1E";
            const starIcon = document.createElement("img");
            starIcon.src = `${imagePath}Group 23.svg`;
            starIcon.style.marginRight = "5px";
            starIcon.style.cursor = "pointer";
            rateButton.appendChild(starIcon);
          }
          else{
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
  
    renderHardSkills(skills, breadcrumbPath, softSkillAccordian, skillId, parentskills = [],skillName) {
        console.log(skillId, "childrenskillid");
        if (!softSkillAccordian) {
            console.error('softSkillAccordian element is not defined.');
            return;
        }
        // Clear existing content in softSkillAccordian before appending new content
        softSkillAccordian.innerHTML = '';
    
        // Render breadcrumb
        this.renderHardSkillBreadcrumb(skills, breadcrumbPath, softSkillAccordian, skillId, parentskills,skillName);
    
        // Create buttons for each skill
        const skillsContainer = document.createElement("div");
        skillsContainer.classList.add("softskillparentaccordian");
        skillsContainer.setAttribute("id", "softskillparentaccordian");
        skillsContainer.setAttribute("data-mdb-target", "#soft-parent-skills");
        skillsContainer.style.textAlign = "left";
    
        skills.forEach(skill => {
            const skillButton = document.createElement("button");
            skillButton.className = "softskillbutton";
            skillButton.style.border = "2px solid rgb(230, 230, 230)";
            skillButton.style.borderRadius = "10px";
            skillButton.style.margin = "5px";
            skillButton.style.padding = "6px 12px";
            skillButton.style.background = "#FFFFFF";
            skillButton.style.cursor = "pointer";
            skillButton.style.color = "#1E1E1E";
            skillButton.style.fontSize = "16px";
            skillButton.setAttribute("data-mdb-tooltip-init", "");
    
            const childCount = skill.child_count || 0;
            const ratingsCount = skill.ratings ? skill.ratings.length : 0;
            const description = skill.description;

            const buttonContentDiv = document.createElement("div")
            buttonContentDiv.style="display:flex; align-items:center; justify-content:center;";

            const skillNameSpan = document.createElement("span");
            skillNameSpan.textContent = skill.name;
            if (skill.proxy_skill) {
              manageTooltip(skillNameSpan,skill.proxy_skill.name);
            }
            else if (skill.name.length > 30) {
              skillNameSpan.classList.add("truncate");
              manageTooltip(skillNameSpan,skill.name);
            }

            if (description) {
              const descriptionImg = document.createElement("img");
              descriptionImg.src = `${imagePath}Group 27.svg`;
              descriptionImg.alt = "description";
              // descriptionImg.title = description;
              descriptionImg.style.marginRight = "10px";
              buttonContentDiv.appendChild(descriptionImg);
              manageTooltip(descriptionImg,description);
            }

            buttonContentDiv.appendChild(skillNameSpan);

            if (childCount > 0) {
                const hoverCircleImg = document.createElement("img");
                hoverCircleImg.src = `${imagePath}hovercircle.png`;
                hoverCircleImg.alt = "circle";
                hoverCircleImg.style.width = "22px";
                hoverCircleImg.style.height = "22px";
                var tooltip = `${childCount} sub categories`;
                // hoverCircleImg.title = `${childCount} sub categories`;
                hoverCircleImg.style.marginLeft = "10px";
                buttonContentDiv.appendChild(hoverCircleImg);
                manageTooltip(hoverCircleImg,tooltip);
            }

            if (ratingsCount > 0) {
              const searchText = searchByName(skill.name);
              if (searchText.length > 0) {
                const starIcon = document.createElement("img");
                starIcon.src = `${imagePath}Group 23.svg`;
                starIcon.style.marginLeft = "5px";
                starIcon.style.cursor = "pointer";
                starIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.changeRateModelElement(skill);
                });
                buttonContentDiv.appendChild(starIcon);
                skillButton.style.backgroundColor="#E0DEFF";
              }
              else{
                const starIcon = document.createElement("i");
                starIcon.className = "fas fa-star";
                starIcon.setAttribute("id",skill.path_addr)
                starIcon.style.marginLeft = "5px";
                starIcon.style.cursor = "pointer";
                starIcon.style.color = "#ccccff";
                starIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.changeRateModelElement(skill);
                });
                buttonContentDiv.appendChild(starIcon);
              }
            }

            skillButton.appendChild(buttonContentDiv);

            skillButton.addEventListener('click', async () => {
                if (skill.child_count === 0) {
                    console.log("zeroskill-data", skill);
                    this.changeRateModelElement(skill);
                } else {
                    const childSkillApiEndpoint = `${ENDPOINT_URL}children/?path_addr=${skill.path_addr}`;
                    const childSkills = await this.fetchSkills(childSkillApiEndpoint);
                    const newBreadcrumbPath = [...breadcrumbPath, { name: skill.name, path_addr: skill.path_addr, ratings: skill.ratings }];
                    this.renderHardSkills(childSkills, newBreadcrumbPath, softSkillAccordian, skillId, parentskills,skillName);
                }
            });
    
            skillsContainer.appendChild(skillButton);
        });
        softSkillAccordian.appendChild(skillsContainer);
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
  var profileButton = document.getElementById("profile-tab0");
  if (profileButton) {
    profileButton.click();
  }
}

// document.addEventListener("DOMContentLoaded", function () {
//   updateProfileData();
// });
