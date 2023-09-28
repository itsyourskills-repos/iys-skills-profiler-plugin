function selectedSkill(params) {
  console.log("api", params);
}

function ratedSkillEvent(params) {
  console.log("ratedSkillEvent", params);
}
const plugin = new IysFunctionalAreasPlugin({
  divID: "serachid",
  onSearchSkillClick: selectedSkill,
  selectedSkilldiv: "selectSkill",
  skillPlayground: "skillPlayground",
  ratedSkillEvent: ratedSkillEvent,
});
plugin.init();
