import fs from "fs";
import data from './output/test.json' assert { type: "json" };
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();


/**
 * Class Definitions
 */

class Faction {
    constructor(faction_name) {
        this.faction_name = faction_name;
        this.enhancements = [];
        this.units = [];
        this.strats = [];
        this.detachment = [];
        this.army_rule = [];
    }
}

class Unit {
    constructor(unit_name) {
        this.unit_name = unit_name;
        this.unit_stats = [];
        this.unit_ranged_weapons = [];
        this.unit_melee_weapons = [];
        this.keywords = "";
        this.num_models = "";
        this.pts_cost  = "";
        this.front_image = "";
        this.back_image = "";
        this.is_named_char = false;
        this.is_battleline = false;
        this.wargear_abilities = [];
        this.core_abilities = [];
        this.faction_abilities = [];
        this.abilities = [];
        this.invuln = "None";
        this.damaged = "NA";
    }
}

class Unit_stats {
    constructor() {
        this.M = "";
        this.T = "";
        this.SV = "";
        this.W = "";
        this.LD = "";
        this.OC = "";
        this.stats_target = ""
    }
}

class Weapon_stats_ranged {
    constructor() {
        this.Range = "";
        this.A = "";
        this.BS = "";
        this.S = "";
        this.AP = "";
        this.D = "";
    }
}

class Weapon_stats_melee {
    constructor() {
        this.Range = "Melee";
        this.A = "";
        this.WS = "";
        this.S = "";
        this.AP = "";
        this.D = "";
    }
}
class Enhancement {
    constructor(enhancement_name) {
        this.enhancement_name = enhancement_name;
        this.enhancement_details = "";
        this.enhancement_cost = "";
    }
}

class Detachment {
    constructor(detachment_name) {
        this.detachment_name = detachment_name;
        this.detachment_rule_name = '';
        this.rule_details = '';
    }
}

class Army_rule {
    constructor(army_rule_name) {
        this.army_rule_name = army_rule_name;
        this.rule_details = '';
    }
}

class Strat {
    constructor(strat_name) {
        this.strat_name = strat_name;
        this.strat_type = '';
        this.strat_cost = '';
        this.strat_when = '';
        this.strat_target = '';
        this.strat_effect = '';
    }
}

class Weapon {
    constructor(weapon_name, type) {
        this.weapon_name = weapon_name;
        this.weapon_type = type;
        this.weapon_notes = "";
        this.weapon_keywords=[];
        this.weapon_stats = {};
    }
}

class Wargear_ability {
    constructor(ability_name) {
        this.ability_name = ability_name;
        this.ability_text = "";
    }
}

class Unit_ability {
    constructor(ability_name) {
        this.ability_name = ability_name;
        this.ability_text = "";
    }
}
/**
 * Constants
 */

const BOLD = 1;
const weapon_details_loc_limit = 10;

const category_troop_uuid = "5d76b6f5-20ae-4d70-8f59-ade72a2add3a"

/***
 * Functions
 */

/**
 * STUB
 * TODO: parse a stratagem
 * @param strat_index
 */
function parse_strat(faction, strat_text){
    let line=0;
    let cp_index = faction.strats.length;

    do {
        if (strat_text[line].R[0].TS[1]=== 16){
            let strat = new Strat(strat_text[line].R[0].T)

            //strat.strat_rule_name = strat_text[line].R[0].T;
            line++;

            strat.strat_type = strat_text[line].R[0].T;
            do {
                line++;
            } while (strat_text[line].R[0].TS[3] === 1);
            line++;

            do {
                strat.strat_when += strat_text[line].R[0].T;
                line++;
            } while (strat_text[line].R[0].T.search("TARGET") === -1);
            line++

            do {
                strat.strat_target += strat_text[line].R[0].T;
                line++;
            } while (strat_text[line].R[0].T.search("EFFECT") === -1);
            line++;

            do {
                strat.strat_effect += strat_text[line].R[0].T;
                line++;
            } while (strat_text[line].R[0].TS[1] === (10.5));

            faction.strats.push(strat);

        } else {
            if (strat_text[line].R[0].TS[1] === 14){
                faction.strats[cp_index].strat_cost=strat_text[line].R[0].T;
                cp_index++;
            }
            line++;
        }

    }while(line < strat_text.length);
}

function parse_army_rule(rule_text){
    let line=0;
    do {
        if (rule_text[line].R[0].TS[1]=== 15){
            let army_rule = new Army_rule(rule_text[line].R[0].T)
            army_rule.army_rule_name = rule_text[line].R[0].T;
            line++;
            do {
                army_rule.rule_details += rule_text[line].R[0].T
                line++;
            }while(line < rule_text.length);
            return army_rule;
            break;
        }
        line++;
    }while(line < rule_text.length);
    console.log("ERROR Parsing Army Rule");
}

function parse_detachment_rule(faction, detachment_text){
    let line=0;
    do {
        if (detachment_text[line].R[0].TS[1]=== 15){
            faction.detachment.detachment_rule_name = detachment_text[line].R[0].T;
            line++;
            do {
                if(detachment_text[line].R[0].TS[3] !== 1){
                    faction.detachment.rule_details += detachment_text[line].R[0].T
                }
                line++;
            }while(line < detachment_text.length);
            break;
        } else {
            line++;
        }

    }while(line < detachment_text.length);
}

function parse_enhancement(faction, enhancement_text){
    let line=0;
    do {
        if (enhancement_text[line].R[0].TS[1] === 16){
            let enhancement = new Enhancement(enhancement_text[line].R[0].T);
            line++;

            do {
                if(enhancement_text[line].R[0].TS[3] !== 1){
                    enhancement.enhancement_details += enhancement_text[line].R[0].T
                }
                line++;
            }while((enhancement_text[line].R[0].TS[1] === 11) && (line < enhancement_text.length));

            faction.enhancements.push(enhancement);
        } else {
            line++;
        }

    }while(line < enhancement_text.length);
}

function parse_datasheet_front(faction, datasheet_text){
    let line=0;
    let unit = {};
    if (datasheet_text[line].R[0].TS[1] === 19){
        unit = new Unit(datasheet_text[line].R[0].T);
        line++;
        if (datasheet_text[line].R[0].TS[3] === 1){
            unit.unit_name += datasheet_text[line].R[0].T;
            line++
        }

        // get stats
        do {
            if((datasheet_text[line].R[0].T.search("KEYWORDS") !== -1)  && (datasheet_text[line].x < 12)){
                line++;
                const keywords = datasheet_text[line].R[0].T.split(',');
                unit.keywords = keywords;
                line++
            }
            if(datasheet_text[line].R[0].T.search("RANGED") != -1) {
                line= line+7;
                do {

                    let weapon = new Weapon(datasheet_text[line].R[0].T, "RANGED WEAPON");
                    line++;
                    if (datasheet_text[line].x < 11) {
                        weapon.weapon_notes = datasheet_text[line].R[0].T.slice(1, -1).split(",");
                        line++;
                    }
                    weapon.weapon_stats = new Weapon_stats_ranged();
                    weapon.weapon_stats.Range = datasheet_text[line].R[0].T;
                    weapon.weapon_stats.A = datasheet_text[line + 1].R[0].T;
                    weapon.weapon_stats.BS = datasheet_text[line + 2].R[0].T;
                    weapon.weapon_stats.S = datasheet_text[line + 3].R[0].T;
                    weapon.weapon_stats.AP = datasheet_text[line + 4].R[0].T;
                    weapon.weapon_stats.D = datasheet_text[line + 5].R[0].T;
                    line = line + 6

                    if ((datasheet_text[line].R[0].TS[2] === 1) && (datasheet_text[line].R[0].TS[1] !== 12)) {
                        line++;
                        weapon.weapon_notes = datasheet_text[line].R[0].T;
                    }
                    unit.unit_ranged_weapons.push(weapon);
                } while (datasheet_text[line].R[0].TS[1] < 11.5);
            }
            if(datasheet_text[line].R[0].T.search("MELEE") !== -1) {
                line = line + 7;
                do {

                    let weapon = new Weapon(datasheet_text[line].R[0].T, "MELEE WEAPON");
                    line++;
                    if (datasheet_text[line].x < 11) {
                        weapon.weapon_keywords = datasheet_text[line].R[0].T.slice(1, -1).split(",");
                        line++;
                    }
                    weapon.weapon_stats = new Weapon_stats_melee();
                    line++;
                    weapon.weapon_stats.A  = datasheet_text[line].R[0].T;
                    weapon.weapon_stats.WS = datasheet_text[line+1].R[0].T;
                    weapon.weapon_stats.S  = datasheet_text[line+2].R[0].T;
                    weapon.weapon_stats.AP = datasheet_text[line+3].R[0].T;
                    weapon.weapon_stats.D  = datasheet_text[line+4].R[0].T;
                    line = line + 5;

                    if ((datasheet_text[line].R[0].TS[2] === 1) && (datasheet_text[line].R[0].TS[1] !== 12)) {
                        line++;
                        weapon.weapon_abilities = datasheet_text[line].R[0].T;
                    }
                    unit.unit_melee_weapons.push(weapon);
                } while ((datasheet_text[line].R[0].TS[1] !== 16) && (datasheet_text[line].R[0].T.search("FACTION") === -1));
            }

            if(datasheet_text[line].R[0].T === "ABILITIES") {
                do {
                    line++;
                    if (datasheet_text[line].R[0].T.search("CORE") !== -1) {
                        line++
                        unit.core_abilities = datasheet_text[line].R[0].T.split(",");
                        line++;
                    }
                    if (datasheet_text[line].R[0].T.search("FACTION") !== -1) {
                        line++
                        unit.faction_abilities = datasheet_text[line].R[0].T;
                        line++;
                    }

                    if ((datasheet_text[line].R[0].TS[2] = BOLD) && (datasheet_text[line].R[0].T.search(":") !== -1)) {
                        do {
                            let ability = new Unit_ability(datasheet_text[line].R[0].T)
                            line++;
                            do {
                                ability.ability_text += datasheet_text[line].R[0].T;
                                line++;
                            } while ((
                                !((datasheet_text[line].R[0].T.search(":") > -1) && (datasheet_text[line].R[0].TS[2]==1))
                                && (datasheet_text[line].R[0].TS[1] === 10.5)))
                            unit.abilities.push(ability);
                        } while ((datasheet_text[line].R[0].TS[1] === 10.5))
                    }
                } while (datasheet_text[line].R[0].TS[1] === 10.5);
            }

            if(datasheet_text[line].R[0].T.search("WARGEAR ABILITIES") !== -1) {
                line++;
                do {
                    if ((datasheet_text[line].R[0].TS[2] = BOLD) && (datasheet_text[line].R[0].T.search(":") !== -1)) {
                        let wargear_ability = new Wargear_ability(datasheet_text[line].R[0].T)
                        line++;
                        do {
                            wargear_ability.ability_text += datasheet_text[line].R[0].T;
                            line++;
                        } while ((datasheet_text[line].R[0].TS[2] != BOLD) && (datasheet_text[line].R[0].T.search(":") === -1))
                        unit.wargear_abilities.push(wargear_ability);
                    }
                } while ((datasheet_text[line].R[0].TS[1] !== 12) && (datasheet_text[line].x < 21));
            }

            if(datasheet_text[line].R[0].T.search("DAMAGED") !== -1){
                line++
                do {
                    unit.damaged = datasheet_text[line].R[0].T;
                    line++
                } while ((datasheet_text[line].R[0].TS[1] === 10.5))

            }

            if(datasheet_text[line].R[0].T.search("INVULNERABLE SAVE") !== -1){
                line++
                unit.invuln = datasheet_text[line].R[0].T;
                line++
            }

            if(datasheet_text[line].R[0].T === "M")  {// time to get the stats
                line = line + 6;
                do {
                    let stats = new Unit_stats();
                    stats.M = datasheet_text[line].R[0].T
                    stats.T = datasheet_text[line+1].R[0].T
                    stats.SV = datasheet_text[line+2].R[0].T
                    stats.W = datasheet_text[line+3].R[0].T
                    stats.LD = datasheet_text[line+4].R[0].T
                    stats.OC = datasheet_text[line+5].R[0].T
                    line = line + 6;
                    stats.stats_target = unit.unit_name;

                    unit.unit_stats.push(stats);
                    if(line >= datasheet_text.length){
                        break;
                    }
                } while (datasheet_text[line].R[0].TS[1] === 18)
            } else if(datasheet_text[line].R[0].T === "T")  {// time to get the stats
                line = line + 5;
                do {
                    let stats = new Unit_stats();
                    stats.M = "20+";
                    stats.T = datasheet_text[line].R[0].T;
                    stats.SV = datasheet_text[line+1].R[0].T;
                    stats.W = datasheet_text[line+2].R[0].T;
                    stats.LD = datasheet_text[line+3].R[0].T;
                    stats.OC = datasheet_text[line+4].R[0].T;
                    line = line + 7;
                    stats.stats_target = unit.unit_name;

                    unit.unit_stats.push(stats);
                    if(line >= datasheet_text.length){
                        break;
                    }
                } while (datasheet_text[line].R[0].TS[1] === 18)
            }

            line++;
        }while(line < datasheet_text.length);
        // get Abilities

    } else {
        line++;
    }
    faction.units.push(unit);

}

function parse_datasheet_back(faction, datasheet_text){
    let line=0;
    if (datasheet_text[line].R[0].TS[1] === 16){
        let unit = new Unit(datasheet_text[line].R[0].T);
        line++;

        // get wargear options
        // get unit composition
        // get right side
        do {

        }while(line < datasheet_text.length);


    } else {
        line++;
    }

}

//TODO: Actually do this
/**
 * Steps through the pages in the index, and parses datasheets.
 * @param source_path
 * @param cb
 */
async function parse_index(source_path, cb){

    let page_num = 0;
    let datasheet_obj = {};
    let faction_determined = false;
    let detachment_determined = false;

    let faction = {};
    let detachment = {};

    let parse_datasheet_order = "front";
    // events
    pdfParser.on("data", page => {

        let page_type = "datasheet";
        if(page.Texts.length === 0){
            let page_type = "picture";
        } else {
            let page_type_index = 0;
            page.Texts.forEach((element, index) => {
                let line_output = "";
                for (let word of element.R){
                    word.T = word.T.replaceAll("%20", " ");
                    word.T = word.T.replaceAll("%2B", "+");
                    word.T = word.T.replaceAll("%2C", ",");
                    word.T = word.T.replaceAll(".", '');
                    word.T = word.T.replaceAll('%E2%80%99', "'");
                    word.T = word.T.replaceAll('%E2%80%98', "'");
                    word.T = word.T.replaceAll('%C3%A9', "é");
                    word.T = word.T.replaceAll('%C3%B4', "ô");
                    word.T = word.T.replaceAll('%C3%9B', "Û");
                    word.T = word.T.replaceAll('%C3%A2', "â");
                    word.T = word.T.replaceAll('%E2%80%93', "-");
                    word.T = word.T.replaceAll('%E2%96%A0', "\n - ");
                    word.T = word.T.replaceAll('%3A', ": \n" );
                    word.T = word.T.replaceAll('%5B', "[" );
                    word.T = word.T.replaceAll('%5D', "]" );
                    word.T = word.T.replaceAll('%22', '"' );
                    word.T = word.T.replaceAll('%%E2%80%A6', '...' );
                    if(word.TS[1]==24){
                        page_type = word.T;
                    } else {
                        page_type_index++;
                    }

                    line_output += word.T;
                }
                //console.log("Line %d:  %s",index, line_output);

            }); // clean text

            if(!faction_determined){
                console.log("Faction: ", page.Texts[0].R[0].T);
                faction = new Faction(page.Texts[0].R[0].T);
                faction_determined = true;
            } else if (!detachment_determined){
                console.log("Detachment: ", page.Texts[0].R[0].T);
                faction.detachment = new Detachment(page.Texts[0].R[0].T);
                detachment_determined = true;
            }


            switch (page_type){
                case "ARMY RULE": {
                    faction.army_rule = parse_army_rule(page.Texts);
                    console.log("%s\n%s", faction.army_rule.army_rule_name, faction.army_rule.rule_details);
                    break;
                }
                case "DETACHMENT RULE": {
                    parse_detachment_rule(faction, page.Texts);
                    console.log("%s\n%s", faction.detachment.detachment_rule_name, faction.detachment.rule_details);
                    break;
                }
                case "STRATAGEMS": {
                    parse_strat(faction, page.Texts);
                    break;
                }
                case "ENHANCEMENTS": {
                    parse_enhancement(faction, page.Texts);
                    break;
                }
                case "datasheet":{
                    if (parse_datasheet_order === "front"){
                        console.log("adding unit");
                        parse_datasheet_front(faction, page.Texts)
                        parse_datasheet_order = "back";
                    } else {
                        parse_datasheet_back(faction, page.Texts)
                        parse_datasheet_order = "front";
                    }
                    break;
                }
                default: break;
            }
        }
        page_num++;
    });

    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log("time to make the data");
        cb(datasheet_obj)
        fs.writeFile("./output/test.json", JSON.stringify(faction), (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("File written successfully\n");
            }
        });
    });



    pdfParser.loadPDF(source_path);

}

function parse_munitorium(source_path, output_path){
    let faction_list = [];
    let page_num = 0;

    pdfParser.on("data", page => {
        if (page_num != 0){
            page.Texts.forEach(element => {
                let line_output = "";
                element.R.forEach(word => {
                    word.T = word.T.replaceAll("%20"," ");
                    word.T = word.T.replaceAll("%2B","+");
                    word.T = word.T.replaceAll("%2C",",");
                    word.T = word.T.replaceAll(".",'');
                    word.T = word.T.replaceAll('%E2%80%99',"'");
                    word.T = word.T.replaceAll('%E2%80%98',"'");
                    word.T = word.T.replaceAll('%C3%A9',"é");
                    word.T = word.T.replaceAll('%C3%B4',"ô");
                    word.T = word.T.replaceAll('%C3%9B',"Û");
                    word.T = word.T.replaceAll('%C3%A2',"â");
                    line_output += word.T;
                })
            });

            if (page.Texts[0].R[0].T !== "DETACHMENT ENHANCEMENTS") {
                const current_faction = new Faction(page.Texts[0].R[0].T);
                console.log("Adding info for "+ current_faction.faction_name);
                let i = 1;

                do {
                    if(page.Texts[i].R[0].T === "DETACHMENT ENHANCEMENTS"){
                        add_enhancements_to_faction(current_faction, page.Texts, i);
                        break;
                    }
                    if(page.Texts[i].R[0].TS[2]==1) {
                        let unit_name = page.Texts[i].R[0].T;
                        console.log("Adding Unit %s", unit_name);
                        i = add_unit_to_faction(current_faction, page.Texts, i+1, unit_name);

                    } else {
                        i++;
                    }
                    if (i >= page.Texts.length){
                        break;
                    }

                } while (i <= (page.Texts.length))

                faction_list.push(current_faction);
                console.log("Faction added "+ current_faction.faction_name);
            }
            else {
                add_enhancements_to_faction(faction_list[faction_list.length-1], page.Texts, 0);
            }
        }
        page_num++;

    });
    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log("time to make the data");

        fs.writeFile(output_path, JSON.stringify(faction_list), (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("File written successfully\n");
            }
        });
    });

    pdfParser.loadPDF(source_path);

}

function determine_num_text_elements(unit_text, index) {
    let starting = index;
    let num = 0;
    do {
        if ((unit_text[starting].R[0].TS[2] != 1) && (starting < (unit_text.length - 1))){
            num++;
            starting++;
        }else break;
    } while (1)
    return num;
}

function add_unit_to_faction (faction, unit_text, index, unit_name){
    let num_text_elements = determine_num_text_elements(unit_text, index);
    let pts_index = index;

    const unit = new Unit(unit_name);
    
    let response = get_model_info(unit_text,index);
    unit.num_models = response[0];
    pts_index = response[1];
    unit.pts_cost = unit_text[pts_index].R[0].T;
    let next_index = pts_index+1;
    faction.units.push(unit)
    if ((num_text_elements > 3) && (index + 6 <= unit_text.length)) {
        return add_unit_to_faction(faction, unit_text, next_index, unit_name)
    } else {
        return next_index;
    }

}

function add_enhancements_to_faction(faction, unit_text, index){

    faction.enhancements.push(new Enhancement(unit_text[index+2].R[0].T,unit_text[index+4].R[0].T));
    faction.enhancements.push(new Enhancement(unit_text[index+5].R[0].T,unit_text[index+7].R[0].T));
    faction.enhancements.push(new Enhancement(unit_text[index+8].R[0].T,unit_text[index+10].R[0].T));
    faction.enhancements.push(new Enhancement(unit_text[index+11].R[0].T,unit_text[index+13].R[0].T));
    // enhancement 1 name index + 2 cost
}

function get_model_info (unit_text, index){
    let model_info = "";

    while (unit_text[index].R[0].T !=" "){
        model_info += unit_text[index].R[0].T;
        index++;
    }
    index++;
    return [model_info, index];
}

function json_to_battlescribe(source, dest) {
    let initial_xml_header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<catalogue id="' + generateGUID() + '" name="' + source.faction_name + '"  revision="1" battleScribeVersion="2.03" library="false" gameSystemId="28ec-711c-d87f-3aeb" gameSystemRevision="248" xmlns="http://www.battlescribe.net/schema/catalogueSchema">' +
        '<readme> This is an autogenerated file from munitorium parser </readme>' +
        '<selectionEntries>';

    let all_unit_xml = '';
    source.units.forEach(unit => {
        let unit_xml_preamble = '<selectionEntry id="' + generateGUID() + '" name="' + convert_name_for_bs(unit)+ '" hidden="false" collective="false" import="true" type="unit">';
        let category_xml = '<categoryLinks>' +
            '<categoryLink id="' + generateGUID() + '" name="New CategoryLink" hidden="false" targetId="' + category_troop_uuid + '" primary="true"/>' +
            '</categoryLinks>';
        let costs_xml = '<costs>' +
            '<cost name="pts" typeId="points" value="' + convert_pts_for_bs(unit.pts_cost) + '"/>' +
            '</costs>';
        let unit_xml_close = '</selectionEntry>';
        all_unit_xml += unit_xml_preamble + category_xml + costs_xml + unit_xml_close;
    });
    let xml_close = "</selectionEntries></catalogue>";
    dest(initial_xml_header+all_unit_xml+xml_close);
}

function convert_pts_for_bs(initial) {
    return initial.replace(' pts','.0');
}

/**
 *
 * @param initial
 * @returns {string|*}
 */
function convert_name_for_bs(initial) {
    if (initial.num_models != "1 model"){
        return (initial.unit_name + ' - ' + initial.num_models);
    } else {
        return initial.unit_name;
    }

}

/**
 * Generates a unique 16 byte GUID/UUID
 * @returns {string} (GUID)
 */
function generateGUID() {
    var d = new Date().getTime();
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

/**
 * function merges munitorium and datasheet data to create SUPER JSON.
 */
function merge_points_and_datasheets(){
    //todo

}

/**
 *
 * @param full_faction_list_obj
 */
function generate_all_cats(full_faction_list_obj){
    full_faction_list_obj.forEach(faction => {
        json_to_battlescribe(faction, function (xml_string){
            let output_target = './output/'+faction.faction_name+'_10E_pts_only.cat';
            fs.writeFile(output_target,xml_string, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("%s File written successfully Meow\n", output_target);
                }
            });
        });

    })

}

/***
 * Playground
 */

parse_index('./datasources/Orks.pdf');
//parse_munitorium('./test.pdf','./output/test.json');
