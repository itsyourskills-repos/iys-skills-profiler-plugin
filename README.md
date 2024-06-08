# Skills-Profiler-Plugin

IYS Skills Profiler Plugin HTML/CSS/JS code to integrate the IYS Skills Profiler in any application that will enable users of the application to search, select, explore, rate, and profile skills. The output data will be in JSON that can be stored at the application end.

For more info please check docs : https://docs.iysskillstech.com/plugin/skills-profiler

# Plugin changes:

1. Rating Box changes to newly added the zero level rating in rating Slide bar.
2. Rating Box Experience Recency radio buttons are changed to the checkbox and don't select default Experience Recency.
3. To search the skill (.Net Framework Technologies) skills display design changed.

To get the localstorage (iys) and add the conditions to hide or show in this plugin

    Const iysplugin=Json.parse(localstorage.getItem(‘iys’));

    Example json data: 

    {
        "tap": "search or profile or all",
        "profile_view": "quick or tabular or all",
        "isEdit": true or false,
        "isDelete": true or false
    }

    “tab”: “search”	-  Only show the search navbar
    “tab”: “profile"- Only show the profile navbar
    “tab”: “all” 	- To show the both search and profile

	“profile-view”: “quick” - only show the quick view
	“profile-view”: “tabular” - only show the tabular view
	“profile-view”: “all” - to show the both view

	* If the isEdit or isDelete is true to show the edit and delete icon 
	* If the isEdit or isDelete is false don't show the edit and delete icon