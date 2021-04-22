export default {
	OPEN_DATA_HUB_BASE: process.env.ODH_BASE_URL,
	OPEN_DATA_HUB_ALL_ELEMENTS: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=sactive.eq.true&shownull=true&distinct=true',
	OPEN_DATA_HUB_ONLY_SHOW_MAP: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=smetadata.show_on_map.eq.1,sactive.eq.true&shownull=true&distinct=true',
	OPEN_DATA_HUB_TYPES_GROUPS: process.env.ODH_BASE_URL+'/*/latest?limit=-1&offset=0&select=tmetadata,mvalue&shownull=false&distinct=true',
	OPEN_DATA_HUB_BUILDINGS: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=smetadata.building_code.neq.null&where=smetadata.building_name.neq.null',
	OPEN_DATA_HUB_FLOORS: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=smetadata.floor_name.neq.null&where=smetadata.image.neq.null&where=smetadata.show_on_map.eq.1',
	OPEN_DATA_HUB_TRANSLATIONS: process.env.ODH_BASE_URL+'/*/latest?limit=-1&offset=0&select=tmetadata,mvalue&shownull=false&distinct=true&where=mvalue.eq.Traduzioni',
};
