function selectedSkill(params) {
  console.log("apidata", params);
}

const plugin = new IysFunctionalAreasPlugin({
  divID: "serachid",
  onSearchSkillClick: selectedSkill,
  selectedSkilldiv: "selectSkill",
  skillPlayground: "skillPlayground",
  ratedSkillEvent: ratedSkillEvent,
});
plugin.init();
function ratedSkillEvent(params) {
  console.log("ratedSkillEvent", params);
  console.log("seleced skill", plugin.ratedSelectedSkills);
}
