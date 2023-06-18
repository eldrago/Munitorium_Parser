import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();

class Faction {
    constructor(faction_name) {
        this.faction_name = faction_name;
        this.enhancements = [];
        this.units = [];
    }
}

class Unit {
    constructor(unit_name) {
        this.unit_name = unit_name;
        this.num_models = "";
        this.pts_cost  = "";
        this.front_image = "";
        this.back_image = "";
        this.is_named_char = false;
        this.is_battleline = false;
    }
}

class Enhancement {
    constructor(enhancement_name, enhancement_cost) {
        this.enhancement_name = enhancement_name;
        this.enhancement_cost = enhancement_cost;
    }
}


function parse_datasheets(source_path, output_path){

    let page_num = 0;

    pdfParser.on("data", page => {
        console.log("page "+ page_num);
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
                //console.log(line_output);
            });
            //todo turn this into a class or whatever that is called in JS... its been a while.
            /*
            let faction_obj = {
                "faction_name": page.Texts[0].R[0].T,
                "units" : []
            };

             */
            let current_faction = new Faction(page.Texts[0].R[0].T);
            //todo turn this into a class or whatever that is called in JS... its been a while.
            let unit_obj = {
                "unit_name": "",
                "front_image": "",
                "back_image": "",
                "isNamedChar": false,
                "isBattleline": false,
            }



            if (faction_obj.faction_name !== "DETACHMENT ENHANCEMENTS") {
                console.log("Adding info for "+ faction_obj.faction_name);
                let i = 1;

                do {
                    if(page.Texts[i].R[0].TS[2]==1) {
                        let unit_name = page.Texts[i].R[0].T;
                        console.log("Adding Unit %s", unit_name);
                        i = add_unit_to_faction(faction_obj, page.Texts, i+1, unit_name);

                    } else {
                        i++;
                    }
                    if (i >= page.Texts.length){
                        break;
                    }
                    if(page.Texts[i].R[0].T === "DETACHMENT ENHANCEMENTS"){
                        break;
                    }

                } while (i <= (page.Texts.length))

                armies.push(faction_obj);
                console.log("faction Info added "+ faction_obj.faction_name);
            }
        }
        page_num++;

    });
    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log("time to make the data");
        let file_to_write = JSON.stringify(armies);
        fs.writeFile("./output/test.json", JSON.stringify(armies), (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("File written successfully\n");
            }
        });
    });

    pdfParser.loadPDF("./test.pdf");

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

parse_munitorium('./test.pdf','./output/test.json');