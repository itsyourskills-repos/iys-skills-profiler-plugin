// new format
let previousData = [
  {
    comment: "dfg",
    rating: [
      {
        isot_rating_id: "ratings/1-1",
        rating: 2,
        comment: "dfg",
      },
      {
        isot_rating_id: "ratings/2",
        rating: 2,
        comment: "dfg",
      },
    ],
    isot_file_id: "13074779",
    isot_file: {
      path_addr: "13074779",
      name: "AWS Consultant",
      description: null,
      ratings: [
        {
          _id: "ratings/1",
          rating_category: "Experience Recency",
          rating_scale_type: "Two Choice Rating",
          rating_scale_label: ["Current", "Past"],
        },
        {
          _id: "ratings/2",
          rating_category: "Experience Level",
          rating_scale_type: "Four Scale Rating",
          rating_scale_label: [
            "0 - 2 years",
            "2 - 5 years",
            "5 - 10 years",
            "10+ years",
          ],
        },
      ],
      tags: [
        {
          _id: "tags/12",
          title: "Role / Occupation",
        },
      ],
      display_order: null,
      child_count: 4,
    },
  },
  {
    comment: "dfgdf",
    rating: [
      {
        isot_rating_id: "ratings/1-1",
        rating: 2,
        comment: "dfgdf",
      },
      {
        isot_rating_id: "ratings/2",
        rating: 2,
        comment: "dfgdf",
      },
    ],
    isot_file_id: "13149404",
    isot_file: {
      path_addr: "13149404",
      name: "Django Backend Developer",
      description: null,
      ratings: [
        {
          _id: "ratings/1",
          rating_category: "Experience Recency",
          rating_scale_type: "Two Choice Rating",
          rating_scale_label: ["Current", "Past"],
        },
        {
          _id: "ratings/2",
          rating_category: "Experience Level",
          rating_scale_type: "Four Scale Rating",
          rating_scale_label: [
            "0 - 2 years",
            "2 - 5 years",
            "5 - 10 years",
            "10+ years",
          ],
        },
      ],
      tags: [
        {
          _id: "tags/12",
          title: "Role / Occupation",
        },
      ],
      display_order: null,
      child_count: 4,
    },
  },
  {
    comment: "dfg",
    rating: [
      {
        isot_rating_id: "ratings/8",
        rating: 3,
        comment: "dfg",
      },
      {
        isot_rating_id: "ratings/2",
        rating: 3,
        comment: "dfg",
      },
    ],
    isot_file_id: "12167747",
    isot_file: {
      path_addr: "12167747",
      name: "AppleScript",
      description: null,
      ratings: [
        {
          _id: "ratings/8",
          rating_category: "Expertise Level",
          rating_scale_type: "Four Scale Rating",
          rating_scale_label: [
            "Learning / Basic Understanding",
            "Familiar / Applied Understanding",
            "Advanced / Complex Applications",
            "Expert / Guru",
          ],
        },
        {
          _id: "ratings/2",
          rating_category: "Experience Level",
          rating_scale_type: "Four Scale Rating",
          rating_scale_label: [
            "0 - 2 years",
            "2 - 5 years",
            "5 - 10 years",
            "10+ years",
          ],
        },
      ],
      tags: [
        {
          _id: "tags/3",
          title: "Knowledge and Skills",
        },
      ],
      display_order: null,
      child_count: 0,
    },
  },
  {
    comment: "sdf",
    rating: [
      {
        isot_rating_id: "ratings/1-0",
        rating: 1,
        comment: "sdf",
      },
      {
        isot_rating_id: "ratings/2",
        rating: 3,
        comment: "sdf",
      },
    ],
    isot_file_id: "13071411",
    isot_file: {
      path_addr: "13071411",
      name: "AWS Administrator",
      description: null,
      ratings: [
        {
          _id: "ratings/1",
          rating_category: "Experience Recency",
          rating_scale_type: "Two Choice Rating",
          rating_scale_label: ["Current", "Past"],
        },
        {
          _id: "ratings/2",
          rating_category: "Experience Level",
          rating_scale_type: "Four Scale Rating",
          rating_scale_label: [
            "0 - 2 years",
            "2 - 5 years",
            "5 - 10 years",
            "10+ years",
          ],
        },
      ],
      tags: [
        {
          _id: "tags/12",
          title: "Role / Occupation",
        },
      ],
      display_order: null,
      child_count: 4,
    },
  },
  {
    comment: "",
    rating: [
      {
        isot_rating_id: "ratings/1-1",
        rating: 2,
        comment: "",
      },
      {
        isot_rating_id: "ratings/2",
        rating: 2,
        comment: "",
      },
    ],
    isot_file_id: "12964163",
    isot_file: {
      path_addr: "12964163",
      name: ".NET Architect",
      description: null,
      ratings: [
        {
          _id: "ratings/1",
          rating_category: "Experience Recency",
          rating_scale_type: "Two Choice Rating",
          rating_scale_label: ["Current", "Past"],
        },
        {
          _id: "ratings/2",
          rating_category: "Experience Level",
          rating_scale_type: "Four Scale Rating",
          rating_scale_label: [
            "0 - 2 years",
            "2 - 5 years",
            "5 - 10 years",
            "10+ years",
          ],
        },
      ],
      tags: [
        {
          _id: "tags/12",
          title: "Role / Occupation",
        },
      ],
      display_order: null,
      child_count: 4,
    },
  },
];

// older format
// {
//     "skill_id": "dNcSDz4AgnfTVJnkcq78J2",
//     "skill_name": "Networking Roles",
//     "uid": "Y8XWsiuBs8bJ7sZi4XWHVx",
//     "has_direct_child_skills": 1,
//     "has_indirect_child_skills": 0,
//     "has_siblings_skills": 0,
//     "has_relatives_skills_categories": 0,
//     "rating_type": 0,
//     "rating_legend": 1,
//     "parent_name": "Networking Areas",
//     "proxy_name": "",
//     "syn_names": "",
//     "description": "",
//     "ancestors": [
//       {
//         "skill_id": "mz6jnnbnXN9r7awgtaKjwA",
//         "skill_name": "Networking Areas",
//         "uid": "VaU5vDUjfPokGVLWPEvEnN"
//       }
//     ]
//   }

function reduceToOldFormat(data) {
  let oldFormat = [];
  data.forEach((element) => {
    let obj = {};
    obj["skill_id"] = element.isot_file_id;
    obj["skill_name"] = element.isot_file.name;
    obj["uid"] = element.isot_file_id;
    obj["has_direct_child_skills"] = element.isot_file.child_count;
    obj["has_indirect_child_skills"] = 0;
    obj["has_siblings_skills"] = 0;
    obj["has_relatives_skills_categories"] = 0;
    obj["rating_type"] = 0;
    obj["rating_legend"] = 1;
    obj["parent_name"] = "";
    obj["proxy_name"] = "";
    obj["syn_names"] = "";
    obj["description"] = element.isot_file.description;
    obj["ancestors"] = [];

    oldFormat.push(obj);
  });
  console.log("oldFormAT", oldFormat);
  return oldFormat;
}

function reduceToNewFormat(data) {
  let newFormat = [];
  data.forEach((element) => {
    let obj = {};
    obj["comment"] = element.comment;
    // obj["rating"] = element.rating;
    obj["isot_file_id"] = element.isot_file_id;
    obj["isot_file"] = element.isot_file;

    newFormat.push(obj);
  });
  console.log("newFormat", newFormat);
  return newFormat;
}

reduceToOldFormat(previousData);
