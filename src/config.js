export default {
	OPEN_DATA_HUB_BASE: process.env.ODH_BASE_URL,
	OPEN_DATA_HUB_ALL_ELEMENTS: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=sactive.eq.true,sorigin.eq.office365&shownull=true&distinct=true',
	OPEN_DATA_HUB_ONLY_SHOW_MAP: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=smetadata.show_on_map.eq."1",sactive.eq.true,sorigin.eq.office365&shownull=true&distinct=true',
	OPEN_DATA_HUB_TYPES_GROUPS: process.env.ODH_BASE_URL+'/*/latest?limit=-1&offset=0&select=tmetadata,mvalue&shownull=false&distinct=true&where=sorigin.eq.office365',
	OPEN_DATA_HUB_BUILDINGS: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=smetadata.building_code.neq.null,smetadata.building_name.neq.null,sorigin.eq.office365',
	OPEN_DATA_HUB_FLOORS: process.env.ODH_BASE_URL+'?limit=-1&offset=0&select=sname,smetadata&where=smetadata.floor_name.neq.null,smetadata.image.neq.null,smetadata.show_on_map.eq."1",sorigin.eq.office365',
	OPEN_DATA_HUB_TRANSLATIONS: process.env.ODH_BASE_URL+'/*/latest?limit=-1&offset=0&select=tmetadata,mvalue&shownull=false&distinct=true&where=mvalue.eq.Traduzioni,sorigin.eq.office365',
};
