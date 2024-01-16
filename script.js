// Creem una funció per intentar normalitzar les cadenes de texte per poder
// utilitzar-los com a identificadors:
function normalitzaCadena(cadena) {
    return cadena.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
}

// Funció per mostrar el tooltip amb la info:
function showTooltip(event, tooltipText) {
    const tooltip = d3.select("#tooltip");
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    const tooltipWidth = tooltip.node().offsetWidth;
    const tooltipHeight = tooltip.node().offsetHeight;

    // Definim la posició inicial/per defecte a la dreta i a sota del cursor:
    let x = event.pageX + 10;
    let y = event.pageY + 10;

    // Ajustem la posició x si el tooltip quedés fora de la pantalla:
    if (x + tooltipWidth > pageWidth) {
        x = event.pageX - tooltipWidth - 10;
    }

    // Ajustem la posició y si el tooltip quedés fora de la pantalla:
    if (y + tooltipHeight > pageHeight) {
        y = event.pageY - tooltipHeight - 10;
    }

    // Posicionem i mostrem el tooltip a la posició adequada:
    tooltip.style("left", x + "px")
        .style("top", y + "px")
        .html(tooltipText)
        .style("visibility", "visible");
}

// Funció per a moure el tooltip:
function moveTooltip(event) {
    const tooltip = d3.select("#tooltip");
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    const tooltipWidth = tooltip.node().offsetWidth;
    const tooltipHeight = tooltip.node().offsetHeight;

    // Definim la posició inicial/per defecte a la dreta i a sota del cursor:
    let x = event.pageX + 10;
    let y = event.pageY + 10;

    // Ajustem la posició x si el tooltip quedés fora de la pantalla:
    if (x + tooltipWidth > pageWidth) {
        x = event.pageX - tooltipWidth - 10;
    }

    // Ajustem la posició y si el tooltip quedés fora de la pantalla:
    if (y + tooltipHeight > pageHeight) {
        y = event.pageY - tooltipHeight - 10;
    }

    // Posicionem i mostrem el tooltip a la posició adequada:
    tooltip
        .style("left", x + "px")
        .style("top", y + "px");
}

// Funció per a amagar el tooltip:
function hideTooltip() {
    d3.select("#tooltip").style("visibility", "hidden");
}

// Afegim la utilitat per moure'ns entre un conjunt de visualitzacions o 
// l'evolutiu, a partir d'amagar o mostrar certes parts de la pàgina:
let buttonVisualitzacioPerAny = document.getElementById('mostrarVisualitzacioPerAny');
let buttonVisualitzacioEvolutiu = document.getElementById('mostrarVisualitzacioEvolutiu');
let divMainTop = document.getElementById('main_top');
let divMainMiddle = document.getElementById('main_middle');
let divMainBottom = document.getElementById('main_bottom');
let divMainTopEvo = document.getElementById('main_top_evo');
let divMainBottomEvo = document.getElementById('main_bottom_evo');
let butnTipusVehucle = document.getElementById('toggleButtonVehicle');
let butnTipusCausa = document.getElementById('toggleButtonCause');
let butnPersona = document.getElementById('toggleButtonPersona');
let butnVictimitzacio = document.getElementById('toggleButtonVictimitzacio');
let butnSexe = document.getElementById('toggleButtonSexe');
let butnDiaSetmana = document.getElementById('toggleButtonDiaSetmana');
let butnTornDia = document.getElementById('toggleButtonTornDia');
let butnBarri = document.getElementById('toggleButtonBarri');
let dpbxAnys = document.getElementById('selectorAny');

// Afegim el gestor d'esdeveniments als botons:
buttonVisualitzacioPerAny.addEventListener('click', () => {
    // Amaguem els div que no volem mostrar:
    divMainTopEvo.style.display = 'none';
    divMainBottomEvo.style.display = 'none';
    
    // Mostrem els div que volem mostrar:
    divMainTop.style.display = 'flex';
    divMainMiddle.style.display = 'flex';
    divMainBottom.style.display = 'flex';
    butnTipusVehucle.style.display = 'block';
    butnTipusCausa.style.display = 'block';
    butnPersona.style.display = 'block';
    butnVictimitzacio.style.display = 'block';
    butnSexe.style.display = 'block';
    butnDiaSetmana.style.display = 'block';
    butnTornDia.style.display = 'block';
    butnBarri.style.display = 'block';
    dpbxAnys.style.display = 'block';
});

buttonVisualitzacioEvolutiu.addEventListener('click', () => {
    // Amaguem els div que no volem mostrar:
    divMainTop.style.display = 'none';
    divMainMiddle.style.display = 'none';
    divMainBottom.style.display = 'none';
    butnTipusVehucle.style.display = 'none';
    butnTipusCausa.style.display = 'none';
    butnPersona.style.display = 'none';
    butnVictimitzacio.style.display = 'none';
    butnSexe.style.display = 'none';
    butnDiaSetmana.style.display = 'none';
    butnTornDia.style.display = 'none';
    butnBarri.style.display = 'none';
    dpbxAnys.style.display = 'none';

    // Mostrem els div que volem mostrar:
    divMainTopEvo.style.display = 'flex';
    divMainBottomEvo.style.display = 'flex';
});

// És necessari carregar les dades per poder utilitzar-les en la generació 
// del dashboard, a partir del fitxer CSV que vam generar en la primera part:
d3.csv("dfImplicatsAccidentsBCN.csv", d3.autoType).then(function(data) {
    // Abans de començar, modifiquem els camps de coordenades, ja que el valor
    // original conté una coma i en anglès el separador és el punt:
    data.forEach(function(d) {
        // Reemplacem les comes per punts:
        d.Coordenada_UTM_X = String(d.Coordenada_UTM_X).replace(',', '.');
        d.Coordenada_UTM_Y = String(d.Coordenada_UTM_Y).replace(',', '.');

        // Convertim els paràmetres de coordenades a float, assignant el valor 
        // 0 en cas d'error en la conversió:
        d.Coordenada_UTM_X = parseFloat(d.Coordenada_UTM_X) || 0;
        d.Coordenada_UTM_Y = parseFloat(d.Coordenada_UTM_Y) || 0;
    });

    // ---------------------------------------------------------------------
    // 00. FUNCIÓ DE FILTRAT DE DADES:
    // ---------------------------------------------------------------------

    // Creem una funció que retorna els tipus de vehicle seleccionats en el filtre:
    function getVehiclesFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxTipusVehicle input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }

    // Creem una funció que retorna els tipus de causes seleccionades en el filtre:
    function getCauseFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxTipusCausa input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }

    // Creem una funció que retorna els tipus de persones implicades seleccionades en el filtre:
    function getPersonaFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxTipusPersona input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }


    // Creem una funció que retorna els tipus de victimització seleccionades en el filtre:
    function getVictimitzacioFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxTipusVictimitzacio input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }


    // Creem una funció que retorna el sexe de les persones implicades seleccionades en el filtre:
    function getSexeFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxSexe input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }


    // Creem una funció que retorna els dies de la setmana seleccionades en el filtre:
    function getDiaSetmanaFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxDiaSetmana input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }


    // Creem una funció que retorna els torns del dia seleccionades en el filtre:
    function getTornFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxTornDia input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }


    // Creem una funció que retorna els barris seleccionades en el filtre:
    function getBarriFilter() {
        let tipusSeleccionats = [];
        d3.selectAll("#checkboxBarri input[type='checkbox']:checked").each(function() {
            tipusSeleccionats.push(this.value);
        });
        return tipusSeleccionats;
    }
    
    // Creem una funció per filtrar les dades segons els valors seleccionats:
    function filterData(dades, anySeleccionat, tipusVehiclesSeleccionats, tipusCausaSeleccionats, tipusPersona, tipusVictimitzacio, sexe, diaSetmana, torn, barri) {
        return dades.filter(d => d["NK_ Any"] === parseInt(anySeleccionat) && tipusVehiclesSeleccionats.includes(d.Desc_Tipus_vehicle_implicat) && tipusCausaSeleccionats.includes(d.Descripcio_causa_vianant) && tipusPersona.includes(d.Descripcio_tipus_persona) && tipusVictimitzacio.includes(d.Descripcio_victimitzacio) && sexe.includes(d.Descripcio_sexe) && diaSetmana.includes(d.Descripcio_dia_setmana) && torn.includes(d.Descripcio_torn) && barri.includes(d.Nom_barri));
    }

    function updateCharts(any, tipusVehicles, tipusCausa, tipusPersona, tipusVictimitzacio, sexe, diaSetmana, torn, barri) {
        let filteredData = filterData(data, any, tipusVehicles, tipusCausa, tipusPersona, tipusVictimitzacio, sexe, diaSetmana, torn, barri);
        updateStats(filteredData);
        updateChloropleticMapChart(filteredData);
        updateZoomableBubblesChart(filteredData);
        updateNightingaleRoseMonthChart(filteredData);
        updateNightingaleRoseWeekDaysChart(filteredData);
        updateNightingaleRoseTimeChart(filteredData);
    }

    // ---------------------------------------------------------------------
    // 01. CÀLCUL D'ESTADÍSTIQUES GLOBALS
    // ---------------------------------------------------------------------
    
    // Iniciem calculant algunes estadístiques a nivell global, referent al  còmput total dels anys.
    // Mitjana d'accidents per any:
    let iTotalObservacions = data.length;
    let vValorsCategoria = data.map(d => d["NK_ Any"]);
    let vValorsUnics = new Set(vValorsCategoria);
    let iTotalValorsUnics = vValorsUnics.size;
    let fMitjanaGlobal_AccidentsAny = (iTotalObservacions / iTotalValorsUnics).toFixed(2);

    // Mitjana de morts per any:
    let aMorts = data.filter(d => d.Descripcio_victimitzacio.trim().startsWith("Mort"));
    let iTotalMorts = aMorts.length;
    let fMitjanaGlobal_MortsAny = (iTotalMorts / iTotalValorsUnics).toFixed(2);

    // Mitjana de ferits greus per any:
    let aFeritsGreus = data.filter(d => d.Descripcio_victimitzacio.trim().startsWith("Ferit greu"));
    let iTotalFeritsGreus = aFeritsGreus.length;
    let fMitjanaGlobal_FeritsGreus = (iTotalFeritsGreus / iTotalValorsUnics).toFixed(2);

    // Mitjana de ferits lleus per any:
    let aFeritsLleus = data.filter(d => d.Descripcio_victimitzacio.trim().startsWith("Ferit lleu"));
    let iTotalFeritsLleus = aFeritsLleus.length;
    let fMitjanaGlobal_FeritsLleus = (iTotalFeritsLleus / iTotalValorsUnics).toFixed(2);

    // Omplim els controls de filtre de selector d'any únic:
    d3.select("#selectorAny")
        .selectAll('option')
        .data(vValorsUnics)
        .enter()
        .append('option')
        .text(d => d);
    
    // Afegim un event listener per al selector d'anys:
    d3.select("#selectorAny").on("change", function() {
        updateCharts(this.value, getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonVehicle = d3.select("#toggleButtonVehicle");

    // Capturem el div que conté els checkboxes:
    let checkboxContainer = d3.select("#checkboxTipusVehicle");

    // Creem una funció per a alternar la visibilitat del desplegable dels tipus de vehicle:
    toggleButtonVehicle.on("click", function() {
        let displayStatus = checkboxContainer.style("display");
        checkboxContainer.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector dels tipus de vehicle a revisar:
    let tipusVehiclesUnics = new Set(data.map(d => d.Desc_Tipus_vehicle_implicat));
    let checkboxes = d3.select("#checkboxTipusVehicle");
    tipusVehiclesUnics.forEach(tipus => {
        let label = checkboxes.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes de tipus de vehicle:
    d3.selectAll("#checkboxTipusVehicle input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonCause = d3.select("#toggleButtonCause");

    // Capturem el div que conté els checkboxes:
    let checkboxContainerCause = d3.select("#checkboxTipusCausa");

    // Creem una funció per a alternar la visibilitat del desplegable dels tipus de causa:
    toggleButtonCause.on("click", function() {
        let displayStatus = checkboxContainerCause.style("display");
        checkboxContainerCause.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector dels tipus de causa a revisar:
    let tipusCausesUniques = new Set(data.map(d => d.Descripcio_causa_vianant));
    let checkboxesCauses = d3.select("#checkboxTipusCausa");
    tipusCausesUniques.forEach(tipus => {
        let label = checkboxesCauses.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes de tipus de causa:
    d3.selectAll("#checkboxTipusCausa input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonPersona = d3.select("#toggleButtonPersona");

    // Capturem el div que conté els checkboxes:
    let checkboxContainerPersona = d3.select("#checkboxTipusPersona");

    // Creem una funció per a alternar la visibilitat del desplegable dels tipus de persona:
    toggleButtonPersona.on("click", function() {
        let displayStatus = checkboxContainerPersona.style("display");
        checkboxContainerPersona.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector dels tipus de persona a revisar:
    let tipusPersonaUniques = new Set(data.map(d => d.Descripcio_tipus_persona));
    let checkboxesPersona = d3.select("#checkboxTipusPersona");
    tipusPersonaUniques.forEach(tipus => {
        let label = checkboxesPersona.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes de tipus de persona:
    d3.selectAll("#checkboxTipusPersona input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonVictimitzacio = d3.select("#toggleButtonVictimitzacio");

    // Capturem el div que conté els checkboxes:
    let checkboxContainerVictimitzacio = d3.select("#checkboxTipusVictimitzacio");

    // Creem una funció per a alternar la visibilitat del desplegable dels tipus de victimització:
    toggleButtonVictimitzacio.on("click", function() {
        let displayStatus = checkboxContainerVictimitzacio.style("display");
        checkboxContainerVictimitzacio.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector dels tipus de visctimització a revisar:
    let tipusVictimitzacioUniques = new Set(data.map(d => d.Descripcio_victimitzacio));
    let checkboxesVictimitzacio = d3.select("#checkboxTipusVictimitzacio");
    tipusVictimitzacioUniques.forEach(tipus => {
        let label = checkboxesVictimitzacio.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes de tipus de victimització:
    d3.selectAll("#checkboxTipusVictimitzacio input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonSexe = d3.select("#toggleButtonSexe");

    // Capturem el div que conté els checkboxes:
    let checkboxContainerSexe = d3.select("#checkboxSexe");

    // Creem una funció per a alternar la visibilitat del desplegable del sexe:
    toggleButtonSexe.on("click", function() {
        let displayStatus = checkboxContainerSexe.style("display");
        checkboxContainerSexe.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector del sexe a revisar:
    let tipusSexeUniques = new Set(data.map(d => d.Descripcio_sexe));
    let checkboxesSexe = d3.select("#checkboxSexe");
    tipusSexeUniques.forEach(tipus => {
        let label = checkboxesSexe.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes del sexe:
    d3.selectAll("#checkboxSexe input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonDiaSetmana = d3.select("#toggleButtonDiaSetmana");

    // Capturem el div que conté els checkboxes:
    let checkboxContainerDiaSetmana = d3.select("#checkboxDiaSetmana");

    // Creem una funció per a alternar la visibilitat del desplegable del dia de la setmana:
    toggleButtonDiaSetmana.on("click", function() {
        let displayStatus = checkboxContainerDiaSetmana.style("display");
        checkboxContainerDiaSetmana.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector del dia de la setmana a revisar:
    let tipusDiaSetmanaUniques = new Set(data.map(d => d.Descripcio_dia_setmana));
    let checkboxesDiaSetmana = d3.select("#checkboxDiaSetmana");
    tipusDiaSetmanaUniques.forEach(tipus => {
        let label = checkboxesDiaSetmana.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes del dia de la setmana:
    d3.selectAll("#checkboxDiaSetmana input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonTornDia = d3.select("#toggleButtonTornDia");

    // Capturem el div que conté els checkboxes:
    let checkboxContainerTornDia = d3.select("#checkboxTornDia");

    // Creem una funció per a alternar la visibilitat del desplegable del torn del dia:
    toggleButtonTornDia.on("click", function() {
        let displayStatus = checkboxContainerTornDia.style("display");
        checkboxContainerTornDia.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector del torn del dia a revisar:
    let tipusTornDiaUniques = new Set(data.map(d => d.Descripcio_torn));
    let checkboxesTornDia = d3.select("#checkboxTornDia");
    tipusTornDiaUniques.forEach(tipus => {
        let label = checkboxesTornDia.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes del torn del dia:
    d3.selectAll("#checkboxTornDia input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // Capturem el botó que controla l'aparició del desplegable:
    let toggleButtonBarri = d3.select("#toggleButtonBarri");

    // Capturem el div que conté els checkboxes:
    let checkboxBarri = d3.select("#checkboxBarri");

    // Creem una funció per a alternar la visibilitat del desplegable del torn del dia:
    toggleButtonBarri.on("click", function() {
        let displayStatus = checkboxBarri.style("display");
        checkboxBarri.style("display", displayStatus === "none" ? "block" : "none");
    });

    // Omplim els controls de filtre de selector del torn del dia a revisar:
    let tipusBarriUniques = new Set(data.map(d => d.Nom_barri));
    let checkboxesBarri = d3.select("#checkboxBarri");
    tipusBarriUniques.forEach(tipus => {
        let label = checkboxesBarri.append('div')
            .attr('class', 'checkbox-option')
            .append('label');
        
        label.append('input')
            .attr('type', 'checkbox')
            .attr('id', tipus)
            .attr('name', 'vehicle')
            .attr('value', tipus)
            .property('checked', true); 
        
        label.append('span')
            .text(tipus);
    });

    // Afegim un event listener per als checkboxes del torn del dia:
    d3.selectAll("#checkboxBarri input[type='checkbox']").on("change", function() {
        updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());
    });

    // ---------------------------------------------------------------------

    // ---------------------------------------------------------------------
    // 02. ESTADÍSTIQUES (ANY SELECCIONAT)
    // ---------------------------------------------------------------------
    
    // Per poder realitzar l'actualització de les estadístiques, necessitem una funció que controli 
    // les accions necessaries per poder gestionar aquesta actualització:
    function updateStats(dades) {
        // Primer, obtenim els valors absoluts per l'any seleccionat::
        let iTotalObservacions = dades.length;
        let aMorts = dades.filter(d => d.Descripcio_victimitzacio.trim().startsWith("Mort"));
        let iTotalMorts = aMorts.length;
        let aFeritsGreus = dades.filter(d => d.Descripcio_victimitzacio.trim().startsWith("Ferit greu"));
        let iTotalFeritsGreus = aFeritsGreus.length;
        let aFeritsLleus = dades.filter(d => d.Descripcio_victimitzacio.trim().startsWith("Ferit lleu"));
        let iTotalFeritsLleus = aFeritsLleus.length;

        // Calculem l'increment o decrement de cada un:
        let percentatgeCanviTotalObservacions = ((iTotalObservacions - fMitjanaGlobal_AccidentsAny) / fMitjanaGlobal_AccidentsAny) * 100;
        let percentatgeCanviTotalMorts = ((iTotalMorts - fMitjanaGlobal_MortsAny) / fMitjanaGlobal_MortsAny) * 100;
        let percentatgeCanviTotalFeritsGreus = ((iTotalFeritsGreus - fMitjanaGlobal_FeritsGreus) / fMitjanaGlobal_FeritsGreus) * 100;
        let percentatgeCanviTotalFeritsLleus = ((iTotalFeritsLleus - fMitjanaGlobal_FeritsLleus) / fMitjanaGlobal_FeritsLleus) * 100;

        // Posem els valors a cada un dels SVG, utilitzant la funció d'actualització del contingut:
        updateStatsSvg("#st1_accidents", "Implicats", iTotalObservacions, percentatgeCanviTotalObservacions);
        updateStatsSvg("#st2_morts", "Morts", iTotalMorts, percentatgeCanviTotalMorts);
        updateStatsSvg("#st3_greus", "Ferits Greus", iTotalFeritsGreus, percentatgeCanviTotalFeritsGreus);
        updateStatsSvg("#st4_lleus", "Ferits Lleus", iTotalFeritsLleus, percentatgeCanviTotalFeritsLleus);
    }

    // Creem una funció que permeti actualitzar el contingut dels SVG que contenen les estadístiques:
    function updateStatsSvg(svgId, titol, total, percentatgeCanvi) {
        // Necessitem tenir les mides del SVG:
        let svg = d3.select(svgId);
        let contenidor = d3.select(svg.node().parentNode);
        let width = contenidor.node().getBoundingClientRect().width;
        let height = contenidor.node().getBoundingClientRect().height;
    
        // Netegem qualsevol contingut previ del SVG:
        svg.selectAll("*").remove();
    
        // Afegim el títol:
        svg.append("text")
           .attr("x", width / 2)
           .attr("y", 20)
           .attr("text-anchor", "middle")
           .style("font-size", "12px")
           .style("font-family", "Arial")
           .style('fill', '#6D7681')
           .style('font-weight', 'bold')
           .text(titol);
    
        // Afegim el valor total absolut:
        svg.append("text")
           .attr("x", width / 2)
           .attr("y", height / 2)
           .attr("text-anchor", "middle")
           .style("font-size", "30px")
           .style("font-family", "Arial")
           .style('font-weight', 'bold')
           .style('fill', '#6D7681')
           .text(total);
    
        // Afegim el percentatge de canvi, canviant el color segons si ha millorat o empitjorat
        // respecte a la mitjana que hi ha en el conjunt total de les dades:
        svg.append("text")
           .attr("x", width / 2)
           .attr("y", height - 30)
           .attr("text-anchor", "middle")
           .style("font-size", "12px")
           .style("font-family", "Arial")
           .style('font-weight', 'bold')
           .style("fill", percentatgeCanvi >= 0 ? "red" : "green")
           .text(`(${percentatgeCanvi.toFixed(2)}% respecte mitjana)`);
    }

    // ---------------------------------------------------------------------

    // ---------------------------------------------------------------------
    // 03. MAPA CLOROPLÈTIC (ANY SELECCIONAT)
    // ---------------------------------------------------------------------
    
    // Per fer el gràfic interactiu, es defineix una funció que ens permetrà actualitzar el contingut
    // en temps real:
    function updateChloropleticMapChart(dades) {
        // Primer de tot cal preparar les dades perquè ens permeti utilitzar-lo al generar el mapa cloroplètic:
        let oDadesMapa = (d3.rollups(dades, v => v.length, d => d.Nom_barri)).map(([barri, count]) => ({    
            barri: barri,
            count: count
        }));

        oDadesMapa.forEach(function(d) {
            if (d.barri === "el Poble Sec") {
                d.barri = "el Poble-sec";
            }
        });

        // Definim una escala de colors per la representació gràfica:
        let colorScale = d3.scaleSequential()
            .domain(d3.extent(oDadesMapa, d => d.count))
            .interpolator(d3.interpolateReds);

        // Projectem el mapa al SVG utilitzant el fitxer GeoJSON de definició dels barris de Barcelona:
        d3.json("barris.geojson").then(function(barrisGeoJSON) {
            // Capturem el tamany actual en píxels del SVG:
            let div = document.getElementById('mapa_cloropletic');
            let width = div.getBoundingClientRect().width -20;
            let height = div.getBoundingClientRect().height -20;

            // Reinicialitzem el SVG per començar a treballar:
            let svgMapa = d3.select("#gf1_mapa_clor_districtes");
            svgMapa.html("");
                        
            // Configurem les variables necessaries per generar el mapa:
            let projection = d3.geoMercator()
                .fitSize([(width-20), (height-25)], barrisGeoJSON);
            let path = d3.geoPath()
                .projection(projection);

            // Dibuixem els barris de Barcelona:
            svgMapa.selectAll(".barri")
                .data(barrisGeoJSON.features)
                .enter().append("path")
                .attr("class", "barri")
                .attr("d", path)
                .attr("fill", d => {
                    let dada = oDadesMapa.find(b => b.barri === d.properties.NOM);
                    return dada ? colorScale(dada.count) : '#ccc';
                })
                .attr("stroke", "#6D7681")
                .on("mouseover", function(event, d) {
                    // Ressaltem el contorn del barri perquè sigui més visible:
                    let dada = oDadesMapa.find(b => b.barri === d.properties.NOM);
                    d3.select(this)
                        .attr("stroke", "#181818")
                        .attr("stroke-width", 2);

                    // Comprovem si l'element de dades existeix, per mostrar el tooltip amb la informació del barri:
                    if (dada) {
                        showTooltip(event, `${d.properties.NOM} (${dada.count})`);
                    }
                })
                .on("mousemove", function(event) {
                    // Fem que el tooltip es mogui juntament amb el ratolí:
                    moveTooltip(event);
                })
                .on("mouseout", function() {
                    // Amaguem el tooltip quan el ratolí marxa:
                    hideTooltip();
                    
                    // Tornem el contorn del barri a la normalitat quan el ratolí marxa:
                    d3.select(this)
                        .attr("stroke", "#6D7681")
                        .attr("stroke-width", 1);
                });
            
            // Calculem els valors mínim, màxim i mitjà per la llegenda:
            let minValue = d3.min(oDadesMapa, d => d.count);
            let maxValue = d3.max(oDadesMapa, d => d.count);
            let midValue = (minValue + maxValue) / 2;

            // Definim les dimensions i posició de la llegenda dins el SVG:
            let legendX = 50;
            let legendY = height-30;

            // Definim el número de segments i amplades de la llegenda:
            let numSegments = 20; // Número de segments de color en la llegenda
            let legendHeight = 5; // Ample total de la llegenda
            let segmentWidth = (width - 2 * legendX) / numSegments; // Ample de cada segment de color    
            let fontSize = "10px";

            // Afegim els segments de color a la llegenda:
            Array.from({length: numSegments}).forEach((_, i) => {
                svgMapa.append("rect")
                    .attr("x", legendX + i * segmentWidth)
                    .attr("y", legendY)
                    .attr("width", segmentWidth)
                    .attr("height", legendHeight)
                    .style("fill", colorScale(i / numSegments * d3.max(oDadesMapa, d => d.count)));
            });

            // Afegim les etiquetes pels valors mínim, mitjà i màxim:
            svgMapa.append("text")
            .attr("x", legendX)
            .attr("y", legendY + legendHeight + 15)
            .attr("dy", ".05em")
            .attr("text-anchor", "start")
            .style("font-size", fontSize)
            .text(minValue);

            svgMapa.append("text")
                .attr("x", legendX + (width - 2 * legendX) / 2)
                .attr("y", legendY + legendHeight + 15)
                .attr("dy", ".05em")
                .attr("text-anchor", "middle")
                .style("font-size", fontSize)
                .text(midValue);

            svgMapa.append("text")
                .attr("x", legendX + (width - 2 * legendX))
                .attr("y", legendY + legendHeight + 15)
                .attr("dy", ".05em")
                .attr("text-anchor", "end")
                .style("font-size", fontSize)
                .text(maxValue);

            // Afegim un títol al gràfic:
            svgMapa.append('text')
                .attr('x', '20%')
                .attr('y', '5%')
                .attr('text-anchor', 'middle')
                .style('font-size', '23px')
                .style('font-weight', 'bold')
                .style('font-family', 'Arial')
                .text('Distribució per barris');
        }).catch(function(error) {
            console.log(error);
        });
    }

    // ---------------------------------------------------------------------
    

    // ---------------------------------------------------------------------
    // 04. GRÀFIC BOMBOLLES AGRUPADES AMB ZOOM (ANY SELECCIONAT)
    // ---------------------------------------------------------------------
    
    // Per fer el gràfic interactiu, es defineix una funció que ens permetrà actualitzar el contingut
    // en temps real:
    function updateZoomableBubblesChart(dades) {
        // Per poder preparar les dades, és necessari crear la jerarquia que requereix aquest tipus de gràfic:
        function creaJerarquia(dades, nivells) {
            // Si no hi ha més nivells, retornem el recompte de les "fulles" de la jerarquia:
            if (nivells.length === 0) {
                let comptes = d3.rollups(dades, v => v.length, d => d.Descripcio_tipus_persona);
                return comptes.map(([key, value]) => ({
                    name: key,
                    value: value
                }));
            }

            // Agrupem les dades pel primer nivell:
            let agrupaments = d3.groups(dades, d => d[nivells[0]]);

            // Per a cada agrupament, construim la jerarquia dels nivells inferiors:
            let result = agrupaments.map(([key, values]) => ({
                name: key,
                children: creaJerarquia(values, nivells.slice(1))
            }));

            return result;
        }
        
        // Definim els nivells de la jerarquia que volem utilitzar:
        let nivellsJerarquia = ["Descripcio_sexe", "Descripcio_victimitzacio", "Desc_Tipus_vehicle_implicat"];
        
        // Creem l'objecte que conté la jerarquia segons les característiques definides i l'objecte final que
        // utilitzarem per generar el gràfic:
        let jerarquia = {
            name: "accidents",
            children: creaJerarquia(dades, nivellsJerarquia)
        };
        
        let jerarquiaJSON = JSON.stringify(jerarquia, null, 2);
        let jerarquiaObject = JSON.parse(jerarquiaJSON);

        // Definim l'escala de colora a utilitzar:
        let color = d3.scaleLinear()
            .domain([0, 5])
            .range(["hsl(17, 96%, 89%)", "hsl(9, 92%, 62%)"])
            .interpolate(d3.interpolateHcl);
        
        // Capturem el tamany actual en píxels del SVG:
        let div = document.getElementById('bombolles_zoom');
        let width = div.getBoundingClientRect().width;
        let height = div.getBoundingClientRect().height;

        // Procedim a configurar el SVG on es mostrarà el gràfic:
        let svgBombolles = d3.select("#gf2_bombolles_zoom");
        svgBombolles.html("");
        svgBombolles.attr("viewBox", `-${(width-10) / 2} -${(height-10) / 2} ${(width-10)} ${(height-10)}`);

        // Creem la jerarquia D3 a partir de les dades i calculem el layout definitiu a mostrar:
        let pack = d3.pack()
            .size([width, height])
            .padding(3);
        
        let root = d3.hierarchy(jerarquiaObject)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        pack(root);

        // Generem els nodes, ignorant el node arrel:
        let node = svgBombolles.append("g")
            .selectAll("circle")
            .data(root.descendants().slice(1))
            .style("stroke", "#6D7681")
            .style("stroke-width", "0.5px")
            .join("circle")
                .attr("fill", d => d.children ? color(d.depth) : "white")
                .attr("pointer-events", d => !d.children ? "none" : null)
                .on("mouseover", function() { d3.select(this).attr("stroke", "#6D7681"); })
                .on("mouseout", function() { d3.select(this).attr("stroke", "#6D7681"); })
                .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

        // Generem les etiquetes que es mostraran en el gràfic:
        let label = svgBombolles.append("g")
            .style("font", "10px sans-serif")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(root.descendants())
            .join("text")
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .text(d => `${d.data.name}: ${d.value}`);

        // Finalment, definirem el comportament de zoom animat que tindrà el gràfic per poder veure els detalls
        // de cada un dels nodes i subnodes que el conformen:
        let focus = root;
        let view;

        function zoomTo(v) {
            let k = width / v[2];
            view = v;

            label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("r", d => d.r * k);
        }

        function zoom(event, d) {
            focus = d;

            let transition = svgBombolles.transition()
                .duration(event.altKey ? 7500 : 750)
                .tween("zoom", d => {
                    let i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 3.75]);
                    return t => zoomTo(i(t));
                });

            label
            .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .transition(transition)
                .style("fill-opacity", d => d.parent === focus ? 1 : 0)
                .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        // Establim l'event per quan es cliqui sobre un element del gràfic realitzar el zoom:
        svgBombolles.on("click", (event) => zoom(event, root));
        zoomTo([focus.x, focus.y, focus.r * 2.5]);

        // Afegim els events per mostrar el tooltip amb la informació dels elements que formen el gràfic, 
        // per donar una mica més d'informació i interactivitat:
        node.on("mouseover", function(event, d) {
            showTooltip(event, `${d.data.name} (${d.value})`);
            d3.select(this).attr("stroke", "#000");
        }).on("mousemove", function(event) {
            moveTooltip(event);
        }).on("mouseout", function() {
            hideTooltip();
            d3.select(this).attr("stroke", null);
        });

        // Afegim un títol al gràfic:
        svgBombolles.append('text')
            .attr('x', '0%')
            .attr('y', '-45%')
            .attr('text-anchor', 'middle')
            .style('font-size', '23px')
            .style('font-weight', 'bold')
            .style('font-family', 'Arial')
            .text('Distribució per sexe, victimització i vehicle');
    }

    // ---------------------------------------------------------------------


    // ---------------------------------------------------------------------
    // 05. NIGHTINGALE ROSE PER DIA DE LA SETMANA (ANY SELECCIONAT)
    // ---------------------------------------------------------------------
    
    // Per fer el gràfic interactiu, es defineix una funció que ens permetrà actualitzar el contingut
    // en temps real:
    function updateNightingaleRoseMonthChart(dades) {
        // Primer de tot cal preparar les dades perquè ens permeti utilitzar-lo al generar el gràfic Nightingale Rose:
        let countByMonth = {};
        dades.forEach(d => {
            // Si no existeix l'entrada pel mes, el generem:
            if (!countByMonth[d.Nom_mes]) {
                countByMonth[d.Nom_mes] = { Morts: 0, Ferits_greus: 0, Ferits_lleus: 0, Ilesos: 0 };
            }

            // Obtenim la descripció de victimització de l'emenet actual, en minúscules:
            let victimitzacio = d.Descripcio_victimitzacio.toLowerCase();

            // Incrementem el recompte basat en el valor de Descripcio_victimitzacio:
            if (victimitzacio.includes("mort")) {
                countByMonth[d.Nom_mes].Morts++;
            } else if (victimitzacio.includes("ferit greu")) {
                countByMonth[d.Nom_mes].Ferits_greus++;
            } else if (victimitzacio.includes("ferit lleu")) {
                countByMonth[d.Nom_mes].Ferits_lleus++;
            }    else if (victimitzacio.includes("il.lès")) {
                countByMonth[d.Nom_mes].Ilesos++;
            }
        });

        // Convertim el resultat en un array d'objectes, per utilitzar-lo en la generació del gràfic:
        let oDadesNightingaleRose = [];
        for (let month in countByMonth) {
            let entry = { Month: month, ...countByMonth[month] };
            oDadesNightingaleRose.push(entry);
        }

        // Definim i apliquem l'ordre dels mesos perquè no surtin desordenats al gràfic:
        let order = {
            "Gener": 1,
            "Febrer": 2,
            "Març": 3,
            "Abril": 4,
            "Maig": 5,
            "Juny": 6,
            "Juliol": 7,
            "Agost": 8,
            "Setembre": 9,
            "Octubre": 10,
            "Novembre": 11,
            "Desembre": 12
        };
        oDadesNightingaleRose.sort((a, b) => order[a.Month] - order[b.Month]);

        // Capturem el tamany actual en píxels del SVG:
        let div = document.getElementById('victimitzacio_setmana');
        let width = div.getBoundingClientRect().width;
        let height = div.getBoundingClientRect().height;

        // Definim la posició en la que es generarà el gràfic: 
        let radius = (Math.min(width, height) / 2) * 0.9;
        let svgNightingaleRose = d3.select("#gf3_nightingdale_mes");
        svgNightingaleRose.selectAll("*").remove();
        svgNightingaleRose.html("");
        svgNightingaleRose
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
        svgNightingaleRose
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)

        // Definim l'esquema de colors a utilitzar per cada tipus de victimització:
        let colorNightingaleRose = d3.scaleOrdinal()
            .domain(["Ferits_lleus", "Ferits_greus", "Morts"])
            .range([
                "rgba(254, 222, 208, 1)",
                "rgba(251, 165, 165, 1)",
                "rgba(103, 0, 13, 1)"
            ]);

        // Per definir el radi i angle de cada un dels elements, definim les següents variables:
        let angleScale = d3.scaleBand().range([0, 2 * Math.PI]).domain(oDadesNightingaleRose.map(d => d.Month));
        let radiusScale = d3.scaleLinear().range([0, radius]);
        let maxRadiusValue = d3.max(oDadesNightingaleRose, d => 
            d.Morts + d.Ferits_greus + d.Ferits_lleus + d.Ilesos
        );
        radiusScale.domain([0, maxRadiusValue]);

        // Definim una funció per calcular l'inici i final de cada un dels arcs que es dibuixaran:
        function calculateArcs(dades, padAngle = 0.05) {
            let accum = 0;
            return ["Ferits_lleus", "Ferits_greus", "Morts"].map(key => {
                let arc = { 
                    innerRadius: accum, 
                    outerRadius: accum += dades[key]
                };
                return arc;
            });
        }

        // Dibuixem els arcs que conformen el gràfic, afegint interacció quan es passa el ratolí per sobre:
        oDadesNightingaleRose.forEach(d => {
            let arcs = calculateArcs(d);
            let startAngle = angleScale(d.Month);
            let endAngle = startAngle + angleScale.bandwidth();

            arcs.forEach((arcData, i) => {
                svgNightingaleRose.append("path")
                    .datum({
                        key: ["Ferits lleus", "Ferits greus", "Morts"][i],
                        value: arcData.outerRadius - arcData.innerRadius,
                        startAngle: startAngle,
                        endAngle: endAngle
                    })
                    .style("fill", colorNightingaleRose(["Ferits lleus", "Ferits greus", "Morts"][i]))
                    .style("stroke", "#6D7681")
                    .style("stroke-width", "0.5px")
                    .attr("d", d3.arc()
                        .innerRadius(radiusScale(arcData.innerRadius))
                        .outerRadius(radiusScale(arcData.outerRadius))
                    )
                    .on("mouseover", function(event, d) {
                        d3.select(this)
                            .style("stroke", "#181818")
                            .style("stroke-width", "2px"); 

                        showTooltip(event, `${d.key} (${d.value})`);
                    })
                    .on("mousemove", function(event) {
                        moveTooltip(event);
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .style("stroke", "#6D7681")
                            .style("stroke-width", "0.5px");

                        hideTooltip();
                    });
            });
        });

        // Afegim etiquetes amb els noms dels diferents conjunts:
        oDadesNightingaleRose.forEach(d => {
            let angleMitja = angleScale(d.Month) + angleScale.bandwidth() / 2;
            let distànciaText = radius / 2;
        
            let x = distànciaText * Math.sin(angleMitja);
            let y = -distànciaText * Math.cos(angleMitja);
        
            svgNightingaleRose.append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", "0.35em")
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .text(d.Month);
        });

        // Afegim un separador per diferenciar millor cada un dels conjunts:
        let dayAngles = oDadesNightingaleRose.map(d => angleScale(d.Month));
        dayAngles.forEach(angle => {
            svgNightingaleRose.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', d => radiusScale(maxRadiusValue) * Math.sin(angle))
                .attr('y2', d => -radiusScale(maxRadiusValue) * Math.cos(angle))
                .attr('stroke', 'grey')
                .attr('stroke-width', 0.5);
        });

        // Afegim un títol al gràfic:
        svgNightingaleRose.append('text')
            .attr('x', '0%')
            .attr('y', '-45%')
            .attr('text-anchor', 'middle')
            .style('font-size', '23px')
            .style('font-weight', 'bold')
            .style('font-family', 'Arial')
            .text('Distribució per mes de l\'any');
    }

    // ---------------------------------------------------------------------


    // ---------------------------------------------------------------------
    // 06. NIGHTINGALE ROSE PER DIA DE LA SETMANA (ANY SELECCIONAT)
    // ---------------------------------------------------------------------
    
    // Per fer el gràfic interactiu, es defineix una funció que ens permetrà actualitzar el contingut
    // en temps real:    
    function updateNightingaleRoseWeekDaysChart(dades) {
        // Primer de tot cal preparar les dades perquè ens permeti utilitzar-lo al generar el gràfic Nightingale Rose:
        let countByDay = {};
        dades.forEach(d => {
            // Si no existeix l'entrada pel dia de la setmana, el generem:
            if (!countByDay[d.Descripcio_dia_setmana]) {
                countByDay[d.Descripcio_dia_setmana] = { Morts: 0, Ferits_greus: 0, Ferits_lleus: 0, Ilesos: 0 };
            }

            // Obtenim la descripció de victimització de l'emenet actual, en minúscules:
            let victimitzacio = d.Descripcio_victimitzacio.toLowerCase();

            // Incrementem el recompte basat en el valor de Descripcio_victimitzacio:
            if (victimitzacio.includes("mort")) {
                countByDay[d.Descripcio_dia_setmana].Morts++;
            } else if (victimitzacio.includes("ferit greu")) {
                countByDay[d.Descripcio_dia_setmana].Ferits_greus++;
            } else if (victimitzacio.includes("ferit lleu")) {
                countByDay[d.Descripcio_dia_setmana].Ferits_lleus++;
            }    else if (victimitzacio.includes("il.lès")) {
            countByDay[d.Descripcio_dia_setmana].Ilesos++;
            }
        });
        
        // Convertim el resultat en un array d'objectes, per utilitzar-lo en la generació del gràfic:
        let oDadesNightingaleRose = [];
        for (let day in countByDay) {
            let entry = { Dia_setmana: day, ...countByDay[day] };
            oDadesNightingaleRose.push(entry);
        }

        // Definim i apliquem l'ordre dels dies de la setmana perquè no surtin desordenats al gràfic:
        let order = {
            "Dilluns": 1,
            "Dimarts": 2,
            "Dimecres": 3,
            "Dijous": 4,
            "Divendres": 5,
            "Dissabte": 6,
            "Diumenge": 7
        };
        oDadesNightingaleRose.sort((a, b) => order[a.Dia_setmana] - order[b.Dia_setmana]);

        // Capturem el tamany actual en píxels del SVG:
        let div = document.getElementById('victimitzacio_setmana');
        let width = div.getBoundingClientRect().width;
        let height = div.getBoundingClientRect().height;

        // Definim la posició en la que es generarà el gràfic: 
        let radius = (Math.min(width, height) / 2) * 0.9;
        let svgNightingaleRose = d3.select("#gf4_nightingdale_setmana");
        svgNightingaleRose.selectAll("*").remove();
        svgNightingaleRose.html("");
        svgNightingaleRose
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
        svgNightingaleRose
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)

        // Definim l'esquema de colors a utilitzar per cada tipus de victimització:
        let colorNightingaleRose = d3.scaleOrdinal()
            .domain(["Ferits_lleus", "Ferits_greus", "Morts"])
            .range([
                "rgba(254, 222, 208, 1)",
                "rgba(251, 165, 165, 1)",
                "rgba(103, 0, 13, 1)"             
            ]);

        // Per definir el radi i angle de cada un dels elements, definim les següents variables:
        let angleScale = d3.scaleBand().range([0, 2 * Math.PI]).domain(oDadesNightingaleRose.map(d => d.Dia_setmana));
        let radiusScale = d3.scaleLinear().range([0, radius]);
        let maxRadiusValue = d3.max(oDadesNightingaleRose, d => 
            d.Morts + d.Ferits_greus + d.Ferits_lleus + d.Ilesos
        );
        radiusScale.domain([0, maxRadiusValue]);

        // Definim una funció per calcular l'inici i final de cada un dels arcs que es dibuixaran:
        function calculateArcs(dades, padAngle = 0.05) {
            let accum = 0;
            return ["Ferits_lleus", "Ferits_greus", "Morts"].map(key => {
                let arc = { 
                    innerRadius: accum, 
                    outerRadius: accum += dades[key]
                };
                return arc;
            });
        }

        // Dibuixem els arcs que conformen el gràfic, afegint interacció quan es passa el ratolí per sobre:
        oDadesNightingaleRose.forEach(d => {
            let arcs = calculateArcs(d);
            let startAngle = angleScale(d.Dia_setmana);
            let endAngle = startAngle + angleScale.bandwidth();

            arcs.forEach((arcData, i) => {
                svgNightingaleRose.append("path")
                    .datum({
                        key: ["Ferits lleus", "Ferits greus", "Morts"][i],
                        value: arcData.outerRadius - arcData.innerRadius,
                        startAngle: startAngle,
                        endAngle: endAngle
                    })
                    .style("fill", colorNightingaleRose(["Ferits lleus", "Ferits greus", "Morts"][i]))
                    .style("stroke", "#6D7681")
                    .style("stroke-width", "0.5px")
                    .attr("d", d3.arc()
                        .innerRadius(radiusScale(arcData.innerRadius))
                        .outerRadius(radiusScale(arcData.outerRadius))
                    )
                    .on("mouseover", function(event, d) {
                        d3.select(this)
                            .style("stroke", "#181818")
                            .style("stroke-width", "2px"); 

                        showTooltip(event, `${d.key} (${d.value})`);
                    })
                    .on("mousemove", function(event) {
                        moveTooltip(event);
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .style("stroke", "#6D7681")
                            .style("stroke-width", "0.5px");

                        hideTooltip();
                    });
            });
        });

        // Afegim etiquetes amb els noms dels diferents conjunts:
        oDadesNightingaleRose.forEach(d => {
            let angleMitja = angleScale(d.Dia_setmana) + angleScale.bandwidth() / 2;
            let distànciaText = radius / 2;
        
            let x = distànciaText * Math.sin(angleMitja);
            let y = -distànciaText * Math.cos(angleMitja);
        
            svgNightingaleRose.append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", "0.35em")
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .text(d.Dia_setmana);
        });

        // Afegim un separador per diferenciar millor cada un dels conjunts:
        let dayAngles = oDadesNightingaleRose.map(d => angleScale(d.Dia_setmana));
        dayAngles.forEach(angle => {
            svgNightingaleRose.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', d => radiusScale(maxRadiusValue) * Math.sin(angle))
                .attr('y2', d => -radiusScale(maxRadiusValue) * Math.cos(angle))
                .attr('stroke', 'grey')
                .attr('stroke-width', 0.5);
        });

        // Afegim un títol al gràfic:
        svgNightingaleRose.append('text')
            .attr('x', '0%')
            .attr('y', '-45%')
            .attr('text-anchor', 'middle')
            .style('font-size', '23px')
            .style('font-weight', 'bold')
            .style('font-family', 'Arial')
            .text('Distribució per dia de la setmana');
    }

    // ---------------------------------------------------------------------


    // ---------------------------------------------------------------------
    // 07. NIGHTINGALE ROSE PER HORA DIA (ANY SELECCIONAT)
    // ---------------------------------------------------------------------
    
    // Per fer el gràfic interactiu, es defineix una funció que ens permetrà actualitzar el contingut
    // en temps real:
    function updateNightingaleRoseTimeChart(dades) {
        // Primer de tot cal preparar les dades perquè ens permeti utilitzar-lo al generar el gràfic Nightingale Rose:
        let countByTime = {};
        dades.forEach(d => {
            // Si no existeix l'entrada pel torn del dia, el generem:
            if (!countByTime[d.Descripcio_torn]) {
                countByTime[d.Descripcio_torn] = { Morts: 0, Ferits_greus: 0, Ferits_lleus: 0, Ilesos: 0 };
            }

            // Obtenim la descripció de victimització de l'emenet actual, en minúscules:
            let victimitzacio = d.Descripcio_victimitzacio.toLowerCase();

            // Incrementem el recompte basat en el valor de Descripcio_victimitzacio:
            if (victimitzacio.includes("mort")) {
                countByTime[d.Descripcio_torn].Morts++;
            } else if (victimitzacio.includes("ferit greu")) {
                countByTime[d.Descripcio_torn].Ferits_greus++;
            } else if (victimitzacio.includes("ferit lleu")) {
                countByTime[d.Descripcio_torn].Ferits_lleus++;
            }    else if (victimitzacio.includes("il.lès")) {
                countByTime[d.Descripcio_torn].Ilesos++;
            }
        });

        // Convertim el resultat en un array d'objectes, per utilitzar-lo en la generació del gràfic:
        let oDadesNightingaleRose = [];
        for (let time in countByTime) {
            let entry = { Torn_dia: time, ...countByTime[time] };
            oDadesNightingaleRose.push(entry);
        }

        // Definim i apliquem l'ordre dels torns del dia perquè no surtin desordenats al gràfic:
        let order = {
            "Matí": 1,
            "Tarda": 2,
            "Nit": 3
        };
        oDadesNightingaleRose.sort((a, b) => order[a.Torn_dia] - order[b.Torn_dia]);

        // Capturem el tamany actual en píxels del SVG:
        let div = document.getElementById('victimitzacio_setmana');
        let width = div.getBoundingClientRect().width;
        let height = div.getBoundingClientRect().height;

        // Definim la posició en la que es generarà el gràfic: 
        let radius = (Math.min(width, height) / 2) * 0.9;
        let svgNightingaleRose = d3.select("#gf5_nightingdale_hora");
        svgNightingaleRose.selectAll("*").remove();
        svgNightingaleRose.html("");
        svgNightingaleRose
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
        svgNightingaleRose
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)

        // Definim l'esquema de colors a utilitzar per cada tipus de victimització:
        let colorNightingaleRose = d3.scaleOrdinal()
            .domain(["Ferits_lleus", "Ferits_greus", "Morts"])
            .range([
                "rgba(254, 222, 208, 1)",
                "rgba(251, 165, 165, 1)",
                "rgba(103, 0, 13, 1)"            
            ]);

        // Per definir el radi i angle de cada un dels elements, definim les següents variables:
        let angleScale = d3.scaleBand().range([0, 2 * Math.PI]).domain(oDadesNightingaleRose.map(d => d.Torn_dia));
        let radiusScale = d3.scaleLinear().range([0, radius]);
        let maxRadiusValue = d3.max(oDadesNightingaleRose, d => 
            d.Morts + d.Ferits_greus + d.Ferits_lleus + d.Ilesos
        );
        radiusScale.domain([0, maxRadiusValue]);

        // Definim una funció per calcular l'inici i final de cada un dels arcs que es dibuixaran:
        function calculateArcs(dades, padAngle = 0.05) {
            let accum = 0;
            return ["Ferits_lleus", "Ferits_greus", "Morts"].map(key => {
                let arc = { 
                    innerRadius: accum, 
                    outerRadius: accum += dades[key]
                };
                return arc;
            });
        }

        // Dibuixem els arcs que conformen el gràfic, afegint interacció quan es passa el ratolí per sobre:
        oDadesNightingaleRose.forEach(d => {
            let arcs = calculateArcs(d);
            let startAngle = angleScale(d.Torn_dia);
            let endAngle = startAngle + angleScale.bandwidth();

            arcs.forEach((arcData, i) => {
                svgNightingaleRose.append("path")
                    .datum({
                        key: ["Ferits lleus", "Ferits greus", "Morts"][i],
                        value: arcData.outerRadius - arcData.innerRadius, 
                        startAngle: startAngle,
                        endAngle: endAngle
                    })
                    .style("fill", colorNightingaleRose(["Ferits lleus", "Ferits greus", "Morts"][i]))
                    .style("stroke", "#6D7681")
                    .style("stroke-width", "0.5px")
                    .attr("d", d3.arc()
                        .innerRadius(radiusScale(arcData.innerRadius))
                        .outerRadius(radiusScale(arcData.outerRadius))
                    )
                    .on("mouseover", function(event, d) {
                        d3.select(this)
                            .style("stroke", "#181818")
                            .style("stroke-width", "2px"); 

                        showTooltip(event, `${d.key} (${d.value})`);
                    })
                    .on("mousemove", function(event) {
                        moveTooltip(event);
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .style("stroke", "#6D7681")
                            .style("stroke-width", "0.5px");

                        hideTooltip();
                    });
            });
        });

        // Afegim etiquetes amb els noms dels diferents conjunts:
        oDadesNightingaleRose.forEach(d => {
            let angleMitja = angleScale(d.Torn_dia) + angleScale.bandwidth() / 2;
            let distànciaText = radius / 2;
        
            let x = distànciaText * Math.sin(angleMitja);
            let y = -distànciaText * Math.cos(angleMitja);
        
            svgNightingaleRose.append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", "0.35em")
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .text(d.Torn_dia);
        });

        // Afegim un separador per diferenciar millor cada un dels conjunts:
        let dayAngles = oDadesNightingaleRose.map(d => angleScale(d.Torn_dia));
        dayAngles.forEach(angle => {
            svgNightingaleRose.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', d => radiusScale(maxRadiusValue) * Math.sin(angle))
                .attr('y2', d => -radiusScale(maxRadiusValue) * Math.cos(angle))
                .attr('stroke', 'grey')
                .attr('stroke-width', 0.5);
        });

        // Afegim un títol al gràfic:
        svgNightingaleRose.append('text')
            .attr('x', '0%')
            .attr('y', '-45%')
            .attr('text-anchor', 'middle')
            .style('font-size', '23px')
            .style('font-weight', 'bold')
            .style('font-family', 'Arial')
            .text('Distribució per torn del dia');
    }

    // ---------------------------------------------------------------------


    // ---------------------------------------------------------------------
    // 08. GRÀFIC DE LÍNIES (EVOLUTIU)
    // ---------------------------------------------------------------------

    // Preparem les dades per generar aquest gràfic no actualitzable:
    let countByYear = {};
    data.forEach(d => {
        // Si no existeix l'entrada per l'any, el generem:
        if (!countByYear[d["NK_ Any"]]) {
            countByYear[d["NK_ Any"]] = { Morts: 0, Ferits_greus: 0, Ferits_lleus: 0};
        }

        // Obtenim la descripció de victimització de l'emenet actual, en minúscules:
        let victimitzacio = d.Descripcio_victimitzacio.toLowerCase();

        // Incrementem el recompte basat en el valor de Descripcio_victimitzacio:
        if (victimitzacio.includes("mort")) {
            countByYear[d["NK_ Any"]].Morts++;
        } else if (victimitzacio.includes("ferit greu")) {
            countByYear[d["NK_ Any"]].Ferits_greus++;
        } else if (victimitzacio.includes("ferit lleu")) {
            countByYear[d["NK_ Any"]].Ferits_lleus++;
        }
    });

    // Convertim el resultat en un array d'objectes, per utilitzar-lo en la generació del gràfic:
    let oDadesGraficLinies = [];
    for (let any in countByYear) {
        let entry = { Any: any, ...countByYear[any] };
        oDadesGraficLinies.push(entry);
    }

    // Revisem el tamany de la finestra per calcuar el tamany de la zona on es dibuixarà el gràfic, 
    // ja que no es pot obtenir directament:
    let widthEvoAnys = (window.innerWidth * 85) / 100;
    let heightEvoAnys  = (window.innerHeight * 47.5) / 100;
    let marge = { top: 50, right: 50, bottom: 50, left: 50 };

    // Seleccionem el SVG a utilitzar:
    let svgEvoAnys = d3.select("#gf6_evo_lines");

    // Creem les escales necessaries per definir els eixos X i Y del gràfic:
    let xScaleEvoAnys = d3
        .scaleBand()
        .domain(oDadesGraficLinies.map((d) => d.Any))
        .range([marge.left, widthEvoAnys - marge.right])
        .padding(0.1);

    let yScaleEvoAnys = d3
        .scaleLinear()
        .domain([0, d3.max(oDadesGraficLinies, (d) => d.Ferits_lleus)])
        .nice()
        .range([heightEvoAnys - marge.bottom, marge.top]);

    // Afegim l'eix X:
    svgEvoAnys
        .append("g")
        .attr("transform", `translate(0,${heightEvoAnys - marge.bottom})`)
        .call(d3.axisBottom(xScaleEvoAnys));

        svgEvoAnys.selectAll("line.x-grid").data(xScaleEvoAnys.domain()).enter()
        .append("line")
        .attr("class", "x-grid")
        .attr("y1", 0)
        .attr("y2", heightEvoAnys)
        .attr("x1", d => xScaleEvoAnys(d) + xScaleEvoAnys.bandwidth() / 2)
        .attr("x2", d => xScaleEvoAnys(d) + xScaleEvoAnys.bandwidth() / 2)
        .attr("stroke", "lightgray")
        .attr("stroke-width", "1px")
        .attr("stroke-dasharray", "2,2");

    // Afegim l'eix Y:
    svgEvoAnys
        .append("g")
        .attr("transform", `translate(${marge.left},0)`)
        .call(d3.axisLeft(yScaleEvoAnys));

    svgEvoAnys.selectAll("line.y-grid").data(yScaleEvoAnys.ticks()).enter()
        .append("line")
        .attr("class", "y-grid")
        .attr("x1", 0)
        .attr("x2", widthEvoAnys)
        .attr("y1", d => yScaleEvoAnys(d))
        .attr("y2", d => yScaleEvoAnys(d))
        .attr("stroke", "lightgray")
        .attr("stroke-width", "1px")
        .attr("stroke-dasharray", "2,2");

    // Creem la línia que mostrarà els morts i l'afegim al gràfic:
    let lineMorts = d3.line()
        .x((d) => xScaleEvoAnys(d.Any) + xScaleEvoAnys.bandwidth() / 2)
        .y((d) => yScaleEvoAnys(d.Morts));

    svgEvoAnys
        .append("path")
        .datum(oDadesGraficLinies)
        .attr("fill", "none")
        .attr("stroke", "rgba(103, 0, 13, 1)")
        .attr("stroke-width", 2)
        .attr("d", lineMorts);

    // Creem la línia que mostrarà els ferits greus i l'afegim al gràfic:
    let lineGreus = d3.line()
        .x((d) => xScaleEvoAnys(d.Any) + xScaleEvoAnys.bandwidth() / 2)
        .y((d) => yScaleEvoAnys(d.Ferits_greus));

    svgEvoAnys
        .append("path")
        .datum(oDadesGraficLinies)
        .attr("fill", "none")
        .attr("stroke", "rgba(248, 99, 72, 1)")
        .attr("stroke-width", 2)
        .attr("d", lineGreus);

    // Creem la línia que mostrarà els ferits lleus i l'afegim al gràfic:
    let lineLleus = d3.line()
        .x((d) => xScaleEvoAnys(d.Any) + xScaleEvoAnys.bandwidth() / 2)
        .y((d) => yScaleEvoAnys(d.Ferits_lleus));

    svgEvoAnys
        .append("path")
        .datum(oDadesGraficLinies)
        .attr("fill", "none")
        .attr("stroke", "rgba(251, 165, 165, 1)")
        .attr("stroke-width", 2)
        .attr("d", lineLleus);

    // Afegim interactivitat al gràfic, a partir de mostrar rectangles invisibles per capturar esdeveniments de ratolí,
    // que es mostraran en el moment que el ratolí passi per sobre, juntament amb el tooltip amb tota la informació:
    oDadesGraficLinies.forEach(function(d) {
        svgEvoAnys.append("rect")
            .attr("x", xScaleEvoAnys(d.Any))
            .attr("y", 0)
            .attr("width", xScaleEvoAnys.bandwidth())
            .attr("height", heightEvoAnys - marge.bottom)
            .attr("fill", "transparent")
            .on("mouseover", function(event) {
                d3.select(this)
                    .attr("fill", "rgba(64, 64, 64, 0.1)")
                    .attr("stroke", "#rgba(31, 31, 31, 1.0)")
                    .attr("stroke-width", "5px");

                showTooltip(event, `Any: ${d.Any}<br/>Morts: ${d.Morts}<br/>Ferits greus: ${d.Ferits_greus}<br/>Ferits lleus: ${d.Ferits_lleus}`);
            })
            .on("mousemove", function(event) {
                moveTooltip(event);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill", "transparent")
                    .attr("stroke", "none");

                hideTooltip();
            });
    });

    // Afegim la llegenda de colors:
    let legendData = [
        { label: "Morts", color: "rgba(103, 0, 13, 1)" },
        { label: "Ferits greus", color: "rgba(248, 99, 72, 1)" },
        { label: "Ferits lleus", color: "rgba(251, 165, 165, 1)" }
    ];
    
    let legend = svgEvoAnys.selectAll(".legend")
        .data(legendData)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", widthEvoAnys - 46)
        .attr("y", 9)
        .attr("width", 16)
        .attr("height", 16)
        .style("fill", d => d.color);

    legend.append("text")
        .attr("x", widthEvoAnys - 50)
        .attr("y", 17)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d.label);

    // Afegim un títol al gràfic:
    svgEvoAnys.append('text')
        .attr("x", widthEvoAnys / 2)
        .attr("y", (marge.top / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '23px')
        .style('font-weight', 'bold')
        .style('font-family', 'Arial')
        .text('Evolució dels accidents al llarg dels anys');

    // ---------------------------------------------------------------------


    // ---------------------------------------------------------------------
    // 09. TREE MAP CAUSA VIANANT CAUSES VIANANTS (GLOBAL)
    // ---------------------------------------------------------------------

    // Filtrem per incloure només les entrades amb una causa d'accident atribuïda als vianants:
    let filteredData = data.filter(d => (d.Descripcio_causa_vianant !== "No és causa del vianant" && d.Descripcio_causa_vianant !== "Desconegut"));

    // Convertim el resultat en un array d'objectes per utilitzar-lo per generar el gràfic:
    function creaJerarquiaCausaVianant(data) {
        let comptes = d3.rollups(data, v => v.length, d => d.Descripcio_causa_vianant);
        return comptes.map(([key, value]) => ({
            name: key,
            value: value
        }));
    }
        
    // Creem l'objecte jeràrquic per poder utilitzar-lo:
    let jerarquiaCausaVianant = {
        name: "accidents",
        children: creaJerarquiaCausaVianant(filteredData)
    };

    // Convertim la jerarquia a JSON:
    let jerarquiaCausaVianantJSON = JSON.stringify(jerarquiaCausaVianant, null, 2);
    let jerarquiaCausaVianantObject = JSON.parse(jerarquiaCausaVianantJSON);

    // Revisem el tamany de la finestra per calcuar el tamany de la zona on es dibuixarà el gràfic, 
    // ja que no es pot obtenir directament:
    let widthCausaVianants = (window.innerWidth * (85/2)) / 100;
    let heightCausaVianants  = (window.innerHeight * 47.5) / 100;
    let margeCausaVianants = { top: 40, right: 0, bottom: 0, left: 0 };  

    let rootTree = d3.hierarchy(jerarquiaCausaVianantObject)
        .sum(d => d.value);

    // Creem el layout del treemap:
    let treemapLayout = d3.treemap()
        .size([widthCausaVianants - (margeCausaVianants.right + margeCausaVianants.left), heightCausaVianants - (margeCausaVianants.top + margeCausaVianants.bottom)])
        .round(true);

    // Apliquem el layout de treemap a les dades:
    treemapLayout(rootTree);

    // Seleccionem el SVG a utilitzar:
    let svgCausaVianants = d3.select("#gf7_evo_causa_vianant"); 
    svgCausaVianants.html("");
    svgCausaVianants
        .attr("width", widthCausaVianants)
        .attr("height", heightCausaVianants);

    // Configurem l'escala de colors, de forma manual:
    let pastelOranges = ["#FFE2CC", "#FFDCC3", "#FFD6BB", "#FFCFB2", "#FFC9A9", "#FFC3A0", "#FFBD98", "#FFB78F", "#FFB086"];
    let colorScaleTreeMap = d3.scaleOrdinal()
        .domain(jerarquiaCausaVianant.children.map(d => d.name))
        .range(pastelOranges);

    // Dibuixem les cel·les del treemap:
    svgCausaVianants.selectAll("rect")
        .data(rootTree.descendants())
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0 + 40)
        .attr("width", d => Math.max(0, d.x1 - d.x0 - 1))
        .attr("height", d => Math.max(0, d.y1 - d.y0 - 1))
        .attr("fill", d => colorScaleTreeMap(d.data.name))
        .attr("stroke", "#6D7681")
        .attr("stroke-width", "0.2px")
        .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("stroke", "#181818")
                    .style("stroke-width", "1px");

                showTooltip(event, `${d.data.name} (${d.value})`);
            })
            .on("mousemove", function(event) {
                moveTooltip(event);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("stroke", "#6D7681")
                    .style("stroke-width", "0.2px");

                hideTooltip();
            });
    
    // Afegim un títol al gràfic:
    svgCausaVianants.append('text')
        .attr("x", widthCausaVianants / 2)
        .attr("y", (margeCausaVianants.top / 2) + 8)
        .attr("text-anchor", "middle")
        .style('font-size', '23px')
        .style('font-weight', 'bold')
        .style('font-family', 'Arial')
        .text('Distribució per causes del vianant');

    // ---------------------------------------------------------------------


    // ---------------------------------------------------------------------
    // 10. TREE MAP TIPUS VEHICLE (GLOBAL)
    // ---------------------------------------------------------------------

    // Convertim el resultat en un array d'objectes per utilitzar-lo per generar el gràfic:
    function creaJerarquiaTipusVehicle(data) {
        let comptes = d3.rollups(data, v => v.length, d => d.Desc_Tipus_vehicle_implicat);
        return comptes.map(([key, value]) => ({
            name: key,
            value: value
        }));
    }
        
    // Creem l'objecte jeràrquic per poder utilitzar-lo:
    let jerarquiaTipusVehicle = {
        name: "accidents",
        children: creaJerarquiaTipusVehicle(data)
    };

    // Convertim la jerarquia a JSON:
    let jerarquiaTipusVehicleJSON = JSON.stringify(jerarquiaTipusVehicle, null, 2);
    let jerarquiaTipusVehicleObject = JSON.parse(jerarquiaTipusVehicleJSON);

    // Revisem el tamany de la finestra per calcuar el tamany de la zona on es dibuixarà el gràfic, 
    // ja que no es pot obtenir directament:
    let widthTipusVehicle = (window.innerWidth * (85/2)) / 100;
    let heightTipusVehicle  = (window.innerHeight * 47.5) / 100;
    let margeTipusVehicle = { top: 40, right: 0, bottom: 0, left: 0 };  

    let rootTreeTipusVehicle = d3.hierarchy(jerarquiaTipusVehicleObject)
        .sum(d => d.value);

    // Creem el layout del treemap:
    let treemapLayoutTipusVehicle = d3.treemap()
        .size([widthTipusVehicle - (margeTipusVehicle.right + margeTipusVehicle.left), heightTipusVehicle - (margeTipusVehicle.top + margeTipusVehicle.bottom)])
        .round(true);

    // Apliquem el layout de treemap a les dades:
    treemapLayoutTipusVehicle(rootTreeTipusVehicle);

    // Seleccionem el SVG a utilitzar:
    let svgTipusVehicle = d3.select("#gf8_evo_vehicles"); 
    svgTipusVehicle.html("");
    svgTipusVehicle
        .attr("width", widthTipusVehicle)
        .attr("height", heightTipusVehicle);

    // Configurem l'escala de colors, de forma manual:
    const pastelOrangesLarge = ["#FFF5E6", "#FFF2E0", "#FFEFDA", "#FFEDD4", "#FFEBCE", "#FFE8C8", "#FFE6C2", "#FFE3BC", "#FFE1B6", "#FFDEB0", "#FFDCAB", "#FFD9A5", "#FFD79F", "#FFD499", "#FFD293", "#FFCF8D", "#FFCD87", "#FFCA81", "#FFC87B", "#FFC575", "#FFC370", "#FFC06A", "#FFBE64", "#FFBB5E", "#FFB958"];
    let colorScaleTreeMapTipusVehicle = d3.scaleOrdinal()
        .domain(jerarquiaTipusVehicle.children.map(d => d.name))
        .range(pastelOrangesLarge);

    // Dibuixem les cel·les del treemap:
    svgTipusVehicle.selectAll("rect")
        .data(rootTreeTipusVehicle.descendants())
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0 + 40)
        .attr("width", d => Math.max(0, d.x1 - d.x0 - 1))
        .attr("height", d => Math.max(0, d.y1 - d.y0 - 1))
        .attr("fill", d => colorScaleTreeMapTipusVehicle(d.data.name))
        .attr("stroke", "#6D7681")
        .attr("stroke-width", "0.2px")
        .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("stroke", "#181818")
                    .style("stroke-width", "1px");

                showTooltip(event, `${d.data.name} (${d.value})`);
            })
            .on("mousemove", function(event) {
                moveTooltip(event);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("stroke", "#6D7681")
                    .style("stroke-width", "0.2px");

                hideTooltip();
            });
    
    // Afegim un títol al gràfic:
    svgTipusVehicle.append('text')
        .attr("x", widthTipusVehicle / 2)
        .attr("y", (margeTipusVehicle.top / 2) + 8)
        .attr("text-anchor", "middle")
        .style('font-size', '23px')
        .style('font-weight', 'bold')
        .style('font-family', 'Arial')
        .text('Distribució per tipus de vehicle');

    // ---------------------------------------------------------------------


    // ---------------------------------------------------------------------
    // 11. INICIALITZACIÓ DELS GRÀFICS AUTOMÀTICS
    // ---------------------------------------------------------------------

    // Inicialitzem els diferents gràfics amb les opcions de filtratge per defecte:
    updateCharts(d3.select("#selectorAny").property("value"), getVehiclesFilter(), getCauseFilter(), getPersonaFilter(), getVictimitzacioFilter(), getSexeFilter(), getDiaSetmanaFilter(), getTornFilter(), getBarriFilter());

    // ---------------------------------------------------------------------
})
.catch(error => {
    console.error('Error carregant l\'arxiu:', error);
});