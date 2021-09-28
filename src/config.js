export default {
	OPEN_DATA_HUB_BASE: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place',
	OPEN_DATA_HUB_ALL_ELEMENTS: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place?limit=-1&offset=0&select=sname,smetadata&where=sactive.eq.true&shownull=true&distinct=true',
	OPEN_DATA_HUB_ONLY_SHOW_MAP: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place?limit=-1&offset=0&select=sname,smetadata&where=smetadata.show_on_map.eq.1,sactive.eq.true&shownull=true&distinct=true',
	OPEN_DATA_HUB_TYPES: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place/*/latest?limit=-1&offset=0&select=tmetadata,mvalue&shownull=false&distinct=true&where=mvalue.eq.Selettori%20Type',
	OPEN_DATA_HUB_TYPES_GROUPS: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place/*/latest?limit=-1&offset=0&select=tmetadata,mvalue&shownull=false&distinct=true&where=mvalue.eq.Selettori%20Group',
	OPEN_DATA_HUB_BUILDINGS: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place?limit=-1&offset=0&select=sname,smetadata&where=smetadata.building_code.neq.null&where=smetadata.building_name.neq.null',
	OPEN_DATA_HUB_FLOORS: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place?limit=-1&offset=0&select=sname,smetadata&where=smetadata.floor_name.neq.null&where=smetadata.image.neq.null&where=smetadata.show_on_map.eq.1',
	OPEN_DATA_HUB_TRANSLATIONS: 'https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place/*/latest?limit=-1&offset=0&select=tmetadata,mvalue&shownull=false&distinct=true&where=mvalue.eq.Traduzioni',
};
