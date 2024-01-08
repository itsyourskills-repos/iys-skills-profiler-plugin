function selectedSkill(params) {
  console.log("apidata", params);
}

const plugin = new IysFunctionalAreasPlugin({
  pluginDivId: "iys-functional-areas-plugin",
  onSearchSkillClick: selectedSkill,
  ratedSkillEvent: ratedSkillEvent,
  // skillsData: previousData,
});
plugin.init();
function ratedSkillEvent(params) {
  console.log("ratedSkillEvent", params);
  console.log("seleced skill", plugin.ratedSelectedSkills);
}
