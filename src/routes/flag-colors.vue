<template>

    <div class="options-overview">
        <header class="title">
            <h1>Flag colors</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="viewport-content" ratio="1x1">
                <canvas id="paperCanvas" />
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="General">
                    <div class="option">
                        <label for="selectedCountry">
                            Selected country
                        </label>
                        <select name="selectedCountry" id="selectedCountry" v-model="options.selectedCountry">
                            <option v-for="(c,k) in countryList" :key="k" :value="c.code">{{c.name}}</option>

                        </select>
                    </div>
                </div>


            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import Matter from "matter-js"
import _ from "lodash"
import Paper from "paper"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            painting: [] as Array<paper.Path>,
            countryList: [
                {"name":"Afghanistan",                          code: "AF", "colors":[{"hex":"#FFFFFF","percent":86},{"hex":"#000000","percent":14}]},
                {"name":"Åland Islands",                        code: "AX", "colors":[{"hex":"#0064AE","percent":57},{"hex":"#FFD300","percent":25},{"hex": "#DB0F16", "percent":18}]},
                {"name":"Albania",                              code: "AL", "colors":[{"hex":"#DA291C","percent":87},{"hex":"#000000","percent":13}]},
                {"name":"Algeria",                              code: "DZ", "colors":[{"hex":"#006633","percent":46},{"hex":"#FFFFFF","percent":48},{"hex":"#D21034","percent":6}]},
                {"name":"American Samoa",                       code: "AS", "colors":[{"hex":"#000066","percent":55},{"hex":"#BD1021","percent":10},{"hex":"#FFFFFF","percent":35}]},
                {"name":"Andorra",                              code: "AD", "colors":[{"hex":"#10069F","percent":33},{"hex":"#FEDD00","percent":28},{"hex":"#D50032","percent":33},{"hex":"#C6AA76","percent":6}]},
                {"name":"Angola",                               code: "AO", "colors":[{"hex":"#CC092F","percent":48},{"hex":"#000000","percent":47},{"hex":"#FFCB00","percent":5}]},
                {"name":"Anguilla",                             code: "AI", "colors":[{"hex":"#012169","percent":75},{"hex":"#FFFFFF","percent":12},{"hex":"#C8102E","percent":9},{"hex":"#99CCFF","percent":1.5},{"hex":"#FF9900","percent":2.5}]},
                {"name":"Antartica",                            code: "AQ", "colors":[{"hex":"#FFFFFF","percent":52},{"hex":"#1B2F4C","percent":48}]},
                {"name":"Antigua and Barbuda",                  code: "AG", "colors":[{"hex":"#EF3340","percent":50},{"hex":"#000000","percent":26},{"hex":"#005EB8","percent":11},{"hex":"#FFFFFF","percent":7},{"hex":"#FFD100","percent":6}]},
                {"name":"Argentina",                            code: "AR", "colors":[{"hex":"#6CACE4","percent":66},{"hex":"#FFFFFF","percent":33},{"hex":"#FFB81C","percent":0.8},{"hex":"#7D4016","percent":.2}]},
                {"name":"Armenia",                              code: "AM", "colors":[{"hex":"#D90012","percent":33.331},{"hex":"#001489","percent":33.33},{"hex":"#FF9E1B","percent":33.33}]},
                {"name":"Aruba",                                code: "AW", "colors":[{"hex":"#418FDE","percent":87},{"hex":"#FBE122","percent":11},{"hex":"#FFF","percent":.8}, {"hex": "#C8102E", "percent": 1.2}]},
                {"name":"Australia",                            code: "AU", "colors":[{"hex":"#012169","percent":79},{"hex":"#FFFFFF","percent":12},{"hex":"#E4002B","percent":9}]},
                {"name":"Austria",                              code: "AT", "colors":[{"hex":"#EF3340","percent":67},{"hex":"#FFFFFF","percent":33}]},
                {"name":"Azerbaijan",                           code: "AZ", "colors":[{"hex":"#0092BC","percent":33},{"hex":"#E4002B","percent":32},{"hex":"#00AF66","percent": 33},{"hex":"#FFFFFF","percent":2}]},
                {"name":"Bahamas, the",                          code: "BS", "colors":[{"hex":"#00A9CE","percent":57},{"hex":"#000000","percent":21.5},{"hex":"#FDDA25","percent":11.5}]},
                {"name":"Bahrain",                              code: "BH", "colors":[{"hex":"#CE1126","percent":67.667},{"hex":"#FFFFFF","percent":33.333}]},
                {"name":"Bangladesh",                           code: "BD", "colors":[{"hex":"#F42A41","percent":21},{"hex":"#006A4E","percent":79}]},
                {"name":"Barbados",                             code: "BB", "colors":[{"hex":"#00267F","percent":66.67},{"hex":"#000000","percent":4.33},{"hex":"#FFC726","percent":29}]},
                {"name":"Belarus",                              code: "BY", "colors":[{"hex":"#D22730","percent":65},{"hex":"#00AF66","percent":30},{"hex":"#FFFFFF","percent":5}]},
                {"name":"Belgium",                              code: "BE", "colors":[{"hex":"#000000","percent":33.34},{"hex":"#FFCD00","percent":33.33},{"hex":"#C8102E","percent":33.33}]},
                {"name":"Belize",                               code: "BZ", "colors":[{"hex":"#D90F19","percent":24},{"hex":"#171696","percent":66},{"hex":"#FFFFFF","percent":10}],},
                {"name":"Benin",                                code: "BJ", "colors":[{"hex":"#008751","percent":40},{"hex":"#FCD116","percent":30},{"hex":"#E8112D","percent":30}]},
                {"name":"Bermuda",                              code: "BM", "colors":[{"hex":"#00205B","percent":7},{"hex":"#FFFFFF","percent":16},{"hex":"#EF3340","percent":77}]},
                {"name":"Bhutan",                               code: "BT", "colors":[{"hex":"#FFCD00","percent":44},{"hex":"#FF6720","percent":42},{"hex":"#FFFFFF","percent":13},{"hex":"#000000","percent":1}]},
                {"name":"Bolivia",                              code: "BO", "colors":[{"hex":"#DA291C","percent":33.34},{"hex":"#F8E600","percent":33.33},{"hex":"#007A33","percent":33.33}]},
                {"name":"Bosnia and Herzegovina",               code: "BA", "colors":[{"hex":"#002F6C","percent":70},{"hex":"#FFFFFF","percent":5},{"hex":"#FFCD00","percent":25}]},
                {"name":"Botswana",                             code: "BW", "colors":[{"hex":"#ABCAE9","percent":75},{"hex":"#FFFFFF","percent":9},{"hex":"#000000","percent":16}]},
                {"name":"Brazil",                               code: "BR", "colors":[{"hex":"#009739","percent":69},{"hex":"#FEDD00","percent":18},{"hex":"#FFFFFF","percent":1},{"hex":"#012169","percent":12}]},
                {"name":"Brunei Darussalam",                    code: "BN", "colors":[{"hex":"#FCE300","percent":56},{"hex":"#FFFFFF","percent":21},{"hex":"#000000","percent":18},{"hex":"#EF3340","percent":5}]},
                {"name":"Bulgaria",                             code: "BG", "colors":[{"hex":"#FFFFFF","percent":33.34},{"hex":"#00966E","percent":33.33},{"hex":"#D62612","percent":33.33}]},
                {"name":"Burkina Faso",                         code: "BF", "colors":[{"hex":"#EF3340","percent":49},{"hex":"#FFCD00","percent":2},{"hex":"#009739","percent":49}]},
                {"name":"Burundi",                              code: "BI", "colors":[{"hex":"#CE1126","percent":31},{"hex":"#FFFFFF","percent":34.5},{"hex":"#1EB53A","percent":34.5}]},
                {"name":"Cambodia",                             code: "KH", "colors":[{"hex":"#032EA1","percent":50},{"hex":"#E00025","percent":40},{"hex":"#FFFFFF","percent":8},{"hex":"#000000","percent":2}]},
                {"name":"Cameroon",                             code: "CM", "colors":[{"hex":"#007A5E","percent":34},{"hex":"#CE1126","percent":31},{"hex":"#FCD116","percent":35}]},
                {"name":"Canada",                               code: "CA", "colors":[{"hex":"#FF0000","percent":64},{"hex":"#FFFFFF","percent":36}]},
                {"name":"Cape Verde",                           code: "CV", "colors":[{"hex":"#003DA5","percent":74},{"hex":"#FFFFFF","percent":16},{"hex":"#EF3340","percent":8},{"hex":"#FFD100","percent":2}]},
                {"name":"Cayman Islands",                       code: "KY", "colors":[{"hex":"#EF3340","percent":12},{"hex":"#FFFFFF","percent":12},{"hex":"#00205B","percent":76}]},
                {"name":"Central African Republic",             code: "CF", "colors":[{"hex":"#003082","percent":20},{"hex":"#FFFFFF","percent":21},{"hex":"#289728","percent":21},{"hex":"#FFCE00","percent":22},{"hex":"#D21034","percent":16}]},
                {"name":"Chad",                                 code: "TD", "colors":[{"hex":"#002664","percent":33.34},{"hex":"#FECB00","percent":33.33},{"hex":"#C60C30","percent":33.33}]},
                {"name":"Chile",                                code: "CL", "colors":[{"hex":"#FFFFFF","percent":35},{"hex":"#DA291C","percent":50},{"hex":"#0032A0","percent":15}]},
                {"name":"China",                                code: "CN", "colors":[{"hex":"#EE1C25","percent":97},{"hex":"#FFFF00","percent":3}]},
                {"name":"Christmas Island",                     code: "CX", "colors":[{"hex":"#0021AD","percent":47},{"hex":"#1C8A42","percent":45},{"hex":"#FFFFFF","percent":1},{"hex":"#FFC639","percent":7}]},
                {"name":"Colombia",                             code: "CO", "colors":[{"hex":"#FFCD00","percent":50},{"hex":"#003087","percent":25},{"hex":"#C8102E","percent":25}]},
                {"name":"Comoros",                              code: "KM", "colors":[{"hex":"#FFD100","percent":22},{"hex":"#FFFFFF","percent":18},{"hex":"#EF3340","percent":16},{"hex":"#003DA5","percent":22},{"hex":"#009739","percent":22}]},
                {"name":"Congo",                                code: "CG", "colors":[{"hex":"#0085CA","percent":67},{"hex":"#FFD100","percent":13},{"hex":"#EF3340","percent":20}]},
                {"name":"Cook Islands",                         code: "CK", "colors":[{"hex":"#00205B","percent":77},{"hex":"#FFFFFF","percent":14},{"hex":"#EF3340","percent":9}]},
                {"name":"Costa Rica",                           code: "CR", "colors":[{"hex":"#00205B","percent":34},{"hex":"#FFFFFF","percent":36},{"hex":"#EF3340","percent":30}]},
                {"name":"Croatia",                              code: "HR", "colors":[{"hex":"#ff0000","percent":36},{"hex":"#FFFFFF","percent":31},{"hex":"#012169","percent":33}]},
                {"name":"Cuba",                                 code: "CU", "colors":[{"hex":"#DA291C","percent":20},{"hex":"#004B87","percent":49},{"hex":"#FFFFFF","percent":31}]},
                {"name":"Cyprus",                               code: "CY", "colors":[{"hex":"#D57800","percent":9},{"hex":"#FFFFFF","percent":89},{"hex":"#4E5B31","percent":2}]},
                {"name":"Czech Republic",                       code: "CZ", "colors":[{"hex":"#11457E","percent":24.67},{"hex":"#FFFFFF","percent":37.33},{"hex":"#D7141A","percent":37.33}]},
                {"name":"Denmark",                              code: "DK", "colors":[{"hex":"#C8102E","percent":77},{"hex":"#FFFFFF","percent":23}]},
                {"name":"Djibouti",                             code: "DJ", "colors":[{"hex":"#6AB2E7","percent":36},{"hex":"#12AD2B","percent":36},{"hex":"#FFFFFF","percent":26},{"hex":"#D7141A","percent":2}]},
                {"name":"Dominica",                             code: "DM", "colors":[{"hex":"#009A44","percent":63},{"hex":"#FFCD00","percent":9},{"hex":"#000000","percent":9},{"hex":"#FFFFFF","percent":9},{"hex":"#E4002B","percent":9},{"hex":"#981E97","percent":1}]},
                {"name":"Dominican Republic",                   code: "DO", "colors":[{"hex":"#002D62","percent":35},{"hex":"#FFFFFF","percent":30},{"hex":"#CE1126","percent":35}]},
                {"name":"Ecuador",                              code: "EC", "colors":[{"hex":"#ffdd00","percent":50},{"hex":"#ed1c24","percent":27},{"hex":"#034ea2","percent":23}]},
                {"name":"Egypt",                                code: "EG", "colors":[{"hex":"#C8102E","percent":33},{"hex":"#FFFFFF","percent":32},{"hex":"#C09300","percent":2},{"hex":"#000000","percent":33}]},
                {"name":"El Salvador",                          code: "SV", "colors":[{"hex":"#0047AB","percent":69},{"hex":"#FFFFFF","percent":31}]},
                {"name":"Equatorial Guinea",                    code: "GQ", "colors":[{"hex":"#3E9A00","percent":31},{"hex":"#E32118","percent":31},{"hex":"#FFFFFF","percent":25},{"hex":"#0073CE","percent":13}]},
                {"name":"Eritrea",                              code: "ER", "colors":[{"hex":"#0BAC24","percent":25},{"hex":"#3C8BDC","percent":25},{"hex":"#EB0433","percent":44},{"hex":"#FBC724","percent":6}]},
                {"name":"Estonia",                              code: "EE", "colors":[{"hex":"#0072CE","percent":33.34},{"hex":"#000000","percent":33.33},{"hex":"#FFFFFF","percent":33.33}]},
                {"name":"Ethiopia",                             code: "ET", "colors":[{"hex":"#009A44","percent":30},{"hex":"#FEDD00","percent":25},{"hex":"#EF3340","percent":30},{"hex":"#0645B1","percent":15}]},
                {"name":"Fiji",                                 code: "FJ", "colors":[{"hex":"#62b5e5","percent":65},{"hex":"#FFFFFF","percent":12},{"hex":"#012169","percent":7},{"hex":"#C8102E","percent":13},{"hex":"#00AD50","percent":1},{"hex":"#FEDD00","percent":2}]},
                {"name":"Finland",                              code: "FI", "colors":[{"hex":"#FFFFFF","percent":60},{"hex":"#002F6C","percent":40}]},
                {"name":"France",                               code: "FR", "colors":[{"hex":"#002654","percent":33.33},{"hex":"#FFFFFF","percent":33.34},{"hex":"#ED2939","percent":33.33}]},
                {"name":"Micronesia (Federate states of)",      code: "FM", "colors":[{"hex":"#ABCAE9","percent":98},{"hex":"#FFFFFF","percent":2}]},
                {"name":"Gabon",                                code: "GA", "colors":[{"hex":"#009E60","percent":33.34},{"hex":"#FCD116","percent":33.33},{"hex":"#4664B2","percent":33.33}]},
                {"name":"Georgia",                              code: "GE", "colors":[{"hex":"#DA291C","percent":64},{"hex":"#FFFFFF","percent":36}]},
                {"name":"Germany",                              code: "DE", "colors":[{"hex":"#000000","percent":33.34},{"hex":"#DD0000","percent":33.33},{"hex":"#FFCC00","percent":33.33}]},
                {"name":"Ghana",                                code: "GH", "colors":[{"hex":"#EF3340","percent":33},{"hex":"#FFD100","percent":31},{"hex":"#009739","percent":33},{"hex":"#000000","percent":3}]},
                {"name":"Greece",                               code: "GR", "colors":[{"hex":"#004C98","percent":60},{"hex":"#FFFFFF","percent":40}]},
                {"name":"Greenland",                            code: "GL", "colors":[{"hex":"#D00C33","percent":50},{"hex":"#FFFFFF","percent":50}]},
                {"name":"Grenada",                              code: "GD", "colors":[{"hex":"#CE1126","percent":40},{"hex":"#FCD116","percent":32},{"hex":"#007A5E","percent":28}]},
                {"name":"Guatemala",                            code: "GT", "colors":[{"hex":"#4997D0","percent":70},{"hex":"#FFFFFF","percent":30}]},
                {"name":"Guinea-Bissau",                        code: "GW", "colors":[{"hex":"#EF3340","percent":32},{"hex":"#FFD100","percent":33},{"hex":"#009739","percent":33},{"hex":"#000000","percent":1}]},
                {"name":"Guinea",                               code: "GN", "colors":[{"hex":"#CE1126","percent":33.33},{"hex":"#FCD116","percent":33.34},{"hex":"#009460","percent":33.33}]},
                {"name":"Guyana",                               code: "GY", "colors":[{"hex":"#EF3340","percent":20},{"hex":"#000000","percent":5},{"hex":"#FFD100","percent":18},{"hex":"#FFFFFF","percent":7},{"hex":"#009739","percent":50}]},
                {"name":"Haiti",                                code: "HT", "colors":[{"hex":"#00209F","percent":47.5},{"hex":"#D21034","percent":47.5},{"hex":"#FFFFFF","percent":3.5},{"hex":"#016A16","percent":1},{"hex":"#F1B517","percent":0.5}]},
                {"name":"Honduras",                             code: "HN", "colors":[{"hex":"#00bce4","percent":67},{"hex":"#FFFFFF","percent":33}]},
                {"name":"Hungary",                              code: "HR", "colors":[{"hex":"#CE2939","percent":33.34},{"hex":"#FFFFFF","percent":33.33},{"hex":"#477050","percent":33.33}]},
                {"name":"Iceland",                              code: "IS", "colors":[{"hex":"#02529C","percent":66},{"hex":"#FFFFFF","percent":16},{"hex":"#DC1E35","percent":18}]},
                {"name":"India",                                code: "IN", "colors":[{"hex":"#FF671F","percent":34},{"hex":"#FFFFFF","percent":30},{"hex":"#06038D","percent":2},{"hex":"#046A38","percent":34}]},
                {"name":"Indonesia",                            code: "ID", "colors":[{"hex":"#FFFFFF","percent":50},{"hex":"#CE1126","percent":50}]},
                {"name":"Iran",                                 code: "IR", "colors":[{"hex":"#239F40","percent":32},{"hex":"#FFFFFF","percent":37},{"hex":"#DA0000","percent":31}]},
                {"name":"Iraq",                                 code: "IQ", "colors":[{"hex":"#CE1126","percent":33},{"hex":"#FFFFFF","percent":31},{"hex":"#000000","percent":33},{"hex":"#007A3D","percent":3}]},
                {"name":"Ireland",                              code: "IE", "colors":[{"hex":"#009A44","percent":33.33},{"hex":"#FFFFFF","percent":33.34},{"hex":"#FF8200","percent":33.33}]},
                {"name":"Israel",                               code: "IL", "colors":[{"hex":"#FFFFFF","percent":64}, {"hex":"#005EB8","percent":36}]},
                {"name":"Italy",                                code: "IT", "colors":[{"hex":"#008C45","percent":33.33},{"hex":"#FFFFFF","percent":33.34},{"hex":"#CD212A","percent":33.33}]},
                {"name":"Ivory Coast",                          code: "CI", "colors":[{"hex":"#FF8200","percent":33.33},{"hex":"#FFFFFF","percent":33.34},{"hex":"#009A44","percent":33.33}]},
                {"name":"Jamaica",                              code: "JM", "colors":[{"hex":"#009B3A","percent":33.33},{"hex":"#FED100","percent":33.34},{"hex":"#000000","percent":33.33}]},
                {"name":"Japan",                                code: "JP", "colors":[{"hex":"#FFFFFF","percent":81},{"hex":"#BC002D","percent":19}]},
                {"name":"Jordan",                               code: "JO", "colors":[{"hex":"#CE1126","percent":25},{"hex":"#000000","percent":27.5},{"hex":"#FFFFFF","percent":20},{"hex":"#007A3D","percent":27.5}]},
                {"name":"Kazakhstan",                           code: "KZ", "colors":[{"hex":"#FAC50F","percent":10},{"hex":"#00AFCA","percent":90}]},
                {"name":"Kenya",                                code: "KE", "colors":[{"hex":"#000000","percent":30},{"hex":"#FFFFFF","percent":11},{"hex":"#BB0000","percent":30},{"hex":"#006600","percent":29}]},
                {"name":"Kiribati",                             code: "KI", "colors":[{"hex":"#EF3340","percent":46},{"hex":"#FFD100","percent":6},{"hex":"#FFFFFF","percent":24},{"hex":"#0032A0","percent":23},{"hex":"#000000","percent":1}]},
                {"name":"Kosovo",                               code: "KV", "colors":[{"hex":"#244AA5","percent":88},{"hex":"#D0A650","percent":10},{"hex":"#FFFFFF","percent":2}]},
                {"name":"Kuwait",                               code: "KW", "colors":[{"hex":"#007A3D","percent":29},{"hex":"#CE1126","percent":29},{"hex":"#FFFFFF","percent":25},{"hex":"#000000","percent":17}]},
                {"name":"Kyrgyzstan",                           code: "KG", "colors":[{"hex":"#FF0000","percent":91},{"hex":"#FFED00","percent":9}]},
                {"name":"Laos",                                 code: "LA", "colors":[{"hex":"#CE1126","percent":50},{"hex":"#002868","percent":42},{"hex":"#FEFFFF","percent":8},]},
                {"name":"Latvia",                               code: "LV", "colors":[{"hex":"#A4343A","percent":80},{"hex":"#FFFFFF","percent":20}]},
                {"name":"Lebanon",                              code: "LB", "colors":[{"hex":"#EE161F","percent":50},{"hex":"#FFFFFF","percent":43},{"hex":"#00A850","percent":7}]},
                {"name":"Lesotho",                              code: "LS", "colors":[{"hex":"#001489","percent":30},{"hex":"#FFFFFF","percent":37},{"hex":"#000000","percent":30},{"hex":"#009A44","percent":3}]},
                {"name":"Liberia",                              code: "LR", "colors":[{"hex":"#00205B","percent":10},{"hex":"#FFFFFF","percent":42},{"hex":"#EF3340","percent":48}]},
                {"name":"Libya",                                code: "LY", "colors":[{"hex":"#E70013","percent":25},{"hex":"#000000","percent":49},{"hex":"#FFFFFF","percent":1},{"hex":"#239E46","percent":25}]},
                {"name":"Liechtenstein",                        code: "LI", "colors":[{"hex":"#000000","percent":2},{"hex":"#003DA5","percent":46},{"hex":"#E4002B","percent":50},{"hex":"#FFD100","percent":2}]},
                {"name":"Lithuania",                            code: "LT", "colors":[{"hex":"#FFB81C","percent":33.34},{"hex":"#046A38","percent":33.33},{"hex":"#BE3A34","percent":33.33}]},
                {"name":"Luxembourg",                           code: "LU", "colors":[{"hex":"#EA141D","percent":33.33},{"hex":"#FFFFFF","percent":33.34},{"hex":"#51ADDA","percent":33}]},
                {"name":"North Macedonia",                      code: "MK", "colors":[{"hex":"#D82126","percent":68},{"hex":"#F8E92E","percent":32}]},
                {"name":"Madagascar",                           code: "MG", "colors":[{"hex":"#F9423A","percent":33.33},{"hex":"#FFFFFF","percent":33.34},{"hex":"#00843D","percent":33.33}]},
                {"name":"Malawi",                               code: "MW", "colors":[{"hex":"#000000","percent":28},{"hex":"#C8102E","percent":38},{"hex":"#007A33","percent":34}]},
                {"name":"Malaysia",                             code: "MY", "colors":[{"hex":"#CC0000","percent":35},{"hex":"#FFFFFF","percent":35},{"hex":"#0032A0","percent":26},{"hex":"#FFD100","percent":4}]},
                {"name":"Maldives",                             code: "MV", "colors":[{"hex":"#C8102E","percent":66.5},{"hex":"#00843D","percent":32},{"hex":"#FFFFFF","percent":1.5}]},
                {"name":"Mali",                                 code: "ML", "colors":[{"hex":"#14B53A","percent":33.33},{"hex":"#FCD116","percent":33.34},{"hex":"#CE1126","percent":33.33}]},
                {"name":"Malta",                                code: "MT", "colors":[{"hex":"#CF142B","percent":50},{"hex":"#FFFFFF","percent":49},{"hex":"#70707","percent":1}]},
                {"name":"Marshall Islands",                     code: "MH", "colors":[{"hex":"#003087","percent":75},{"hex":"#FFFFFF","percent":14},{"hex":"#E57200","percent":11}]},
                {"name":"Mauritania",                           code: "MR", "colors":[{"hex":"#D01C1F","percent":40},{"hex":"#FFD700","percent":5},{"hex":"#00A95C","percent":55}]},
                {"name":"Mauritius",                            code: "MU", "colors":[{"hex":"#EA2839","percent":25},{"hex":"#1A206D","percent":25},{"hex":"#FFD500","percent":25},{"hex":"#00A551","percent":25}]},
                {"name":"Mexico",                               code: "MX", "colors":[{"hex":"#006341","percent":35},{"hex":"#FFFFFF","percent":30},{"hex":"#C8102E","percent":35}]},
                {"name":"Moldova",                              code: "MD", "colors":[{"hex":"#003DA5","percent":36},{"hex":"#FFD100","percent":26},{"hex":"#C8102E","percent":36},{"hex":"#AD7C59","percent":2}]},
                {"name":"Monaco",                               code: "MC", "colors":[{"hex":"#CE1126","percent":50}, {"hex":"#FFFFFF","percent":50}]},
                {"name":"Mongolia",                             code: "MN", "colors":[{"hex":"#DA2032","percent":60},{"hex":"#0066B3","percent":33},{"hex":"#FFD900","percent":7}]},
                {"name":"Montenegro",                           code: "ME", "colors":[{"hex":"#C40308","percent":77},{"hex":"#D4AF3A","percent":21},{"hex":"#B96B29","percent":1},{"hex":"#1D5E91","percent":0.5},{"hex":"#6D8C3E","percent":0.5}]},
                {"name":"Morocco",                              code: "MA", "colors":[{"hex":"#C1272D","percent":97},{"hex":"#006233","percent":3}]},
                {"name":"Mozambique",                           code: "MZ", "colors":[{"hex":"#009739","percent":27},{"hex":"#FFFFFF","percent":6},{"hex":"#000000","percent":21},{"hex":"#FFD100","percent":29},{"hex":"#E4002B","percent":17}]},
                {"name":"Myanmar",                              code: "MM", "colors":[{"hex":"#FFCD00","percent":33},{"hex":"#FFFFFF","percent":10},{"hex":"#43B02A","percent":26},{"hex":"#EE2737","percent":31}]},
                {"name":"Namibia",                              code: "NA", "colors":[{"hex":"#001489","percent":29},{"hex":"#FFC72C","percent":3},{"hex":"#FFFFFF","percent":8},{"hex":"#DA291C","percent":28},{"hex":"#009A44","percent":32}]},
                {"name":"Nauru",                                code: "NR", "colors":[{"hex":"#012169","percent":90},{"hex":"#FFC72C","percent":8},{"hex":"#FFFFFF","percent":2}]},
                {"name":"Nepal",                                code: "NP", "colors":[{"hex":"#FFFFFF","percent":19},{"hex":"#003893","percent":5},{"hex":"#DC143C","percent":76}]},
                {"name":"Netherlands, the",                     code: "NL", "colors":[{"hex":"#C8102E","percent":33.333},{"hex":"#FFFFFF","percent":33.333},{"hex":"#003DA5","percent":33.333}]},
                {"name":"New Zealand",                          code: "NZ", "colors":[{"hex":"#012169","percent":81},{"hex":"#C8102E","percent":11},{"hex":"#FFFFFF","percent":8}]},
                {"name":"Nicaragua",                            code: "NI", "colors":[{"hex":"#0067C6","percent":67},{"hex":"#FFFFFF","percent":33}]},
                {"name":"Niger",                                code: "NE", "colors":[{"hex":"#E05206","percent":39},{"hex":"#FFFF","percent":27},{"hex":"#0DB02B","percent":34}]},
                {"name":"Nigeria",                              code: "NG", "colors":[{"hex":"#008751","percent":66.67},{"hex":"#FFFFFF","percent":33.33}]},
                {"name":"Niue",                                 code: "NU", "colors":[{"hex":"#FEDD00","percent":76},{"hex":"#012169","percent":8},{"hex":"#FFFFFF","percent":8},{"hex":"#C8102E","percent":8}]},
                {"name":"North Korea",                          code: "KP", "colors":[{"hex":"#024FA2","percent":33},{"hex":"#FFFFFF","percent":11},{"hex":"#ED1C27","percent":56}]},
                {"name":"Norway",                               code: "NO", "colors":[{"hex":"#BA0C2F","percent":62},{"hex":"#FFFFFF","percent":18},{"hex":"#00205B","percent":20}]},
                {"name":"Oman",                                 code: "OM", "colors":[{"hex":"#FFFFFF","percent":26},{"hex":"#C8102E","percent":49},{"hex":"#009A44","percent":25}]},
                {"name":"Pakistan",                             code: "PK", "colors":[{"hex":"#01411C","percent":69},{"hex":"#FFFFFF","percent":31}]},
                {"name":"Palau",                                code: "PW", "colors":[{"hex":"#0085CA","percent":83},{"hex":"#FFD100","percent":17}]},
                {"name":"Panama",                               code: "PA", "colors":[{"hex":"#FFFFFF","percent":48},{"hex":"#072357","percent":26},{"hex":"#DA121A","percent":26}]},
                {"name":"Papua New Guinea",                     code: "PG", "colors":[{"hex":"#C8102E","percent":44},{"hex":"#000000","percent":48},{"hex":"#FFFFFF","percent":2},{"hex":"#FFCD00","percent":6}]},
                {"name":"Paraguay",                             code: "PY", "colors":[{"hex":"#D52B1E","percent":34},{"hex":"#FFFFFF","percent":31},{"hex":"#0038A8","percent":34},{"hex":"#000000","percent":1}]},
                {"name":"Peru",                                 code: "PE", "colors":[{"hex":"#C8102E","percent":66.67},{"hex":"#FFFFFF","percent":33.33}]},
                {"name":"Philippines",                          code: "PH", "colors":[{"hex":"#0032A0","percent":39.5},{"hex":"#BF0D3E","percent":39.5},{"hex":"#FFFFFE","percent":18},{"hex":"#FED141","percent":3}]},
                {"name":"Poland",                               code: "PL", "colors":[{"hex":"#FFFFFF","percent":50},{"hex":"#DC143C","percent":50}]},
                {"name":"Portugal",                             code: "PT", "colors":[{"hex":"#046A38","percent":35},{"hex":"#DA291C","percent":58},{"hex":"#FFE900","percent":4},{"hex":"#FFFFFF","percent":2},{"hex":"#002D72","percent":0.5},{"hex":"#000000","percent":0.5}]},
                {"name":"Qatar",                                code: "QA", "colors":[{"hex":"#8A1538","percent":67},{"hex":"#FFFFFF","percent":33}]},
                {"name":"Romania",                              code: "RO", "colors":[{"hex":"#002B7F","percent":33.33},{"hex":"#CE1126","percent":33.34},{"hex":"#FCD116","percent":33.33}]},
                {"name":"Russia",                               code: "RU", "colors":[{"hex":"#FFFFFF","percent":33.33},{"hex":"#1C3578","percent":33.34},{"hex":"#E4181C","percent":33.33}]},
                {"name":"Rwanda",                               code: "RW","colors":[{"hex":"#00A1DE","percent":49},{"hex":"#E5BE01","percent":26},{"hex":"#20603D","percent":25}]},
                {"name":"Saint Kitts and Nevis",                code: "KN", "colors":[{"hex":"#009739","percent":28},{"hex":"#FFD100","percent":11},{"hex":"#000000","percent":30},{"hex":"#FFFFFF","percent":3},{"hex":"#EF3340","percent":28}]},
                {"name":"Saint Lucia",                          code: "LC", "colors":[{"hex":"#0077C8","percent":86},{"hex":"#FFFFFF","percent":3},{"hex":"#000000","percent":4},{"hex":"#FFD100","percent":7}]},
                {"name":"Saint Vincent and the Grenadines",     code: "VC", "colors":[{"hex":"#002674","percent":25},{"hex":"#FCD022","percent":43},{"hex":"#007C2E","percent":32}]},
                {"name":"Samoa",                                code: "WS", "colors":[{"hex":"#CE1126","percent":75},{"hex":"#002B7F","percent":24},{"hex":"#FBFCFD","percent":1}]},
                {"name":"San Marino",                           code: "SM", "colors":[{"hex":"#FFFFFF","percent":50},{"hex":"#5EB6E4","percent":50}]},
                {"name":"São Tomé and Príncipe",                code: "ST", "colors":[{"hex":"#009739","percent":53},{"hex":"#FFD100","percent":31},{"hex":"#000000","percent":3},{"hex":"#EF3340","percent":13}]},
                {"name":"Saudi Arabia",                         code: "SA", "colors":[{"hex":"#165d31","percent":94},{"hex":"#FBFDFC","percent":6}]},
                {"name":"Senegal",                              code: "SN", "colors":[{"hex":"#00853F","percent":36},{"hex":"#E31B23","percent":33},{"hex":"#FDEF42","percent":31}]},
                {"name":"Serbia",                               code: "RS", "colors":[{"hex":"#C6363C","percent":36},{"hex":"#0C4076","percent":26},{"hex":"#FFFFFF","percent":38}]},
                {"name":"Seychelles",                           code: "SC", "colors":[{"hex":"#002F6C","percent":16.5},{"hex":"#FED141","percent":16.5},{"hex":"#D22730","percent":34},{"hex":"#FFFFFF","percent":16.5},{"hex":"#007A33","percent":16.5}]},
                {"name":"Sierra Leone",                         code: "SL", "colors":[{"hex":"#1EB53A","percent":33.33},{"hex":"#FFFFFF","percent":33.34},{"hex":"#0072C6","percent":33.33}]},
                {"name":"Singapore",                            code: "SG", "colors":[{"hex":"#C73b3C","percent":47},{"hex":"#FFFFFF","percent":53}]},
                {"name":"Slovakia",                             code: "SK", "colors":[{"hex":"#EE1C25","percent":39},{"hex":"#FFFFFF","percent":34},{"hex":"#0B4EA2","percent":27}]},
                {"name":"Slovenia",                             code: "SI", "colors":[{"hex":"#FF0000","percent":33.5},{"hex":"#0000FF","percent":33.5},{"hex":"#FFFFFF","percent":32}, {"hex":"#FFE600","percent":1}]},
                {"name":"Solomon Islands",                      code: "SB", "colors":[{"hex":"#0051BA","percent":42},{"hex":"#FFFFFF","percent":3},{"hex":"#FCD116","percent":10},{"hex":"#215B33","percent":45}]},
                {"name":"Somalia",                              code: "SO", "colors":[{"hex":"#4189DD","percent":96},{"hex":"#FFFFFF","percent":4}]},
                {"name":"South Africa",                         code: "ZA", "colors":[{"hex":"#E03C31","percent":21},{"hex":"#FFFFFF","percent":12},{"hex":"#007749","percent":31},{"hex":"#001489","percent":21},{"hex":"#FFB81C","percent":6},{"hex":"#000000","percent":9}]},
                {"name":"South Korea",                          code: "KR", "colors":[{"hex":"#CD2E3A","percent":7},{"hex":"#0F64CD","percent":7},{"hex":"#FFFFFF","percent":78},{"hex":"#000000","percent":8}]},
                {"name":"South Sudan",                          code: "SS", "colors":[{"hex":"#0F47FF","percent":20},{"hex":"#FCDD09","percent":2},{"hex":"#000000","percent":26},{"hex":"#FFFFFF","percent":7},{"hex":"#DA121A","percent":19},{"hex":"#078930","percent":26}]},
                {"name":"Spain",                                code: "ES", "colors":[{"hex":"#AA151B","percent":50},{"hex":"#F1BF00","percent":50}]},
                {"name":"Sri Lanka",                            code: "LK", "colors":[{"hex":"#FFBE29","percent":44},{"hex":"#EB7400","percent":11.5},{"hex":"#8D153A","percent":32},{"hex":"#00534E","percent":11.5},{"hex":"#000000","percent":1}]},
                {"name":"Palestine, State of",                  code: "PS", "colors":[{"hex":"#000000","percent":30},{"hex":"#FFFFFF","percent":24},{"hex":"#E4312b","percent":30},{"hex":"#000000","percent":16}]},
                {"name":"Sudan (the)",                          code: "SD", "colors":[{"hex":"#D21034","percent":30},{"hex":"#FFFFFF","percent":24},{"hex":"#000000","percent":30},{"hex":"#007229","percent":16}]},
                {"name":"Suriname",                             code: "SR", "colors":[{"hex":"#007A33","percent":40},{"hex":"#FFFFFF","percent":20},{"hex":"#FFCD00","percent":3},{"hex":"#C8102E","percent":37}]},
                {"name":"Swaziland",                            code: "SZ", "colors":[{"hex":"#3E5EB9","percent":37.5},{"hex":"#FFFFFF","percent":6},{"hex":"#FFD900","percent":13},{"hex":"#B10C0C","percent":32.5},{"hex":"#000000","percent":7},{"hex":"#333333", percent:4}]},
                {"name":"Sweden",                               code: "SE", "colors":[{"hex":"#006AA7","percent":70},{"hex":"#FECC00","percent":30}]},
                {"name":"Switzerland",                          code: "CH", "colors":[{"hex":"#DA291C","percent":80},{"hex":"#FFFFFF","percent":20}]},
                {"name":"Syria",                                code: "SY","colors":[{"hex":"#CE1126","percent":33.5},{"hex":"#FFFFFF","percent":30},{"hex":"#007A3D","percent":3},{"hex":"#000000","percent":33.5}]},
                {"name":"Taiwan",                               code: "TW","colors":[{"hex":"#FE0000","percent":75},{"hex":"#000095","percent":22},{"hex":"#FEFEFE","percent":3}]},
                {"name":"Tajikistan",                           code: "TJ", "colors":[{"hex":"#CC0000","percent":28.5},{"hex":"#FFFFFF","percent":41},{"hex":"#006600","percent":28.5},{"hex":"#F8C300","percent":2}]},
                {"name":"Tanzania",                             code: "TZ", "colors":[{"hex":"#1EB53A","percent":29},{"hex":"#FCD116","percent":12},{"hex":"#000000","percent":30},{"hex":"#00A3DD","percent":29}]},
                {"name":"Thailand",                             code: "TH", "colors":[{"hex":"#EF3340","percent":33.34},{"hex":"#FFFFFF","percent":33.33},{"hex":"#00247D","percent":33.33}]},
                {"name":"Gambia, the",                          code: "GM", "colors":[{"hex":"#CE1126","percent":33.5},{"hex":"#3A7728","percent":33.5},{"hex":"#0C1C8C","percent":22},{"hex":"#FFFFFF","percent":11},]},
                {"name":"Timor-Leste",                          code: "TL", "colors":[{"hex":"#DA291C","percent":75},{"hex":"#000000","percent":15},{"hex":"#FFC72C","percent":8},{"hex":"#FFFFFF","percent":2}]},
                {"name":"Togo",                                 code: "TG", "colors":[{"hex":"#006A4E","percent":45},{"hex":"#FFCE00","percent":33},{"hex":"#D21034","percent":20},{"hex":"#FFFDFD","percent":2}]},
                {"name":"Tonga",                                code: "TO", "colors":[{"hex":"#C10000","percent":83},{"hex":"#FFFFFF","percent":17}]},
                {"name":"Trinidad and Tobago",                  code: "TT", "colors":[{"hex":"#C8102E","percent":69},{"hex":"#000000","percent":21},{"hex":"#FFFFFF","percent":10}]},
                {"name":"Tunisia",                              code: "TN", "colors":[{"hex":"#C8102E","percent":91},{"hex":"#FFFFFF","percent":9}]},
                {"name":"Turkey",                               code: "TR", "colors":[{"hex":"#E30A17","percent":90},{"hex":"#FFFEFE","percent":10}]},
                {"name":"Turkmenistan",                         code: "TM", "colors":[{"hex":"#E03C31","percent":10},{"hex":"#009739","percent":85},{"hex":"#FFFFFF","percent":1.5},{"hex":"#FFC72C","percent":3.5}]},
                {"name":"Tuvalu",                               code: "TV", "colors":[{"hex":"#012169","percent":7},{"hex":"#418FDE","percent":72},{"hex":"#FFFFFF","percent":8.5},{"hex":"#C8102E","percent":9},{"hex":"#FFCD00","percent":3.5}]},
                {"name":"Uganda",                               code: "UG", "colors":[{"hex":"#FCDC04","percent":33},{"hex":"#000000","percent":31.5},{"hex":"#D90000","percent":31},{"hex":"#FFFFFF","percent":4},{"hex":"#9CA69C","percent":0.5}]},
                {"name":"Ukraine",                              code: "UA", "colors":[{"hex":"#0057B7","percent":50},{"hex":"#FFDD00","percent":50}]},
                {"name":"United Arab Emirates",                 code: "AE", "colors":[{"hex":"#EF3340","percent":25},{"hex":"#009739","percent":25},{"hex":"#FFFFFF","percent":25},{"hex":"#000000","percent":25}]},
                {"name":"United Kingdom",                       code: "GB", "colors":[{"hex":"#CF142B","percent":38},{"hex":"#FFFFFF","percent":34},{"hex": "#012169", percent: 28}]},
                {"name":"United States",                        code: "US", "colors":[{"hex":"#B31942","percent":42},{"hex":"#FFFFFF","percent":39},{"hex":"#0A3161","percent":19}]},
                {"name":"Uruguay",                              code: "UY", "colors":[{"hex":"#001489","percent":36.5},{"hex":"#FFFFFF","percent":59.5},{"hex":"#FFCD00","percent":1.5},{"hex":"#7B3F00","percent":2.5}]},
                {"name":"Uzbekistan",                           code: "UZ", "colors":[{"hex":"#0072CE","percent":31},{"hex":"#DA291C","percent":4},{"hex":"#FFFFFF","percent":33},{"hex":"#43B02A","percent":32}]},
                {"name":"Vanuatu",                              code: "VU", "colors":[{"hex":"#C0102E","percent":32},{"hex":"#000000","percent":26.5},{"hex":"#FFCD00","percent":9.5},{"hex":"#009A44","percent":32}]},
                {"name":"Vatican City",                         code: "", "colors":[{"hex":"#FFE000","percent":51},{"hex":"#FF0000","percent":0.25},{"hex":"#CCCCCC","percent":0.75},{"hex":"#FFFFFF","percent":48}]},
                {"name":"Venezuela",                            code: "VZ", "colors":[{"hex":"#FCD116","percent":33},{"hex":"#CE1126","percent":33},{"hex":"#003893","percent":32},{"hex":"#FFFFFF","percent":2}]},
                {"name":"Vietnam",                              code: "VN", "colors":[{"hex":"#C8102E","percent":93},{"hex":"#FFCD00","percent":7}]},
                {"name":"Western Sahara",                       code: "EH", "colors":[{"hex":"#C4111B","percent":18},{"hex":"#000000","percent":30},{"hex":"#FFFFFF","percent":22},{"hex":"#007A3D","percent":30}]},
                {"name":"Yemen",                                code: "YE", "colors":[{"hex":"#000000","percent":33.34},{"hex":"#CE1126","percent":33.33},{"hex":"#FFFFFF","percent":33.33}]},
                {"name":"Zambia",                               code: "ZM", "colors":[{"hex":"#198A00","percent":75},{"hex":"#DE2010","percent":8},{"hex":"#000000","percent":8},{"hex":"#EF7D00","percent":9}]},
                {"name":"Zimbabwe",                             code: "ZW", "colors":[{"hex":"#009739","percent":27},{"hex":"#FCE300","percent":25},{"hex":"#FFFFFF","percent":13.5},{"hex":"#000000","percent":11.5},{"hex":"#EF3340","percent":23}]},
                
                // ,
                // {"name":"Cocos (Keeling) Islands","code":"CC"},
                // {"name":"Congo, The Democratic Republic of the","code":"CD"},
                // {"name":"Cote D'Ivoire","code":"CI"},
                // {"name":"Falkland Islands (Malvinas)","code":"FK"},
                // {"name":"Faroe Islands","code":"FO"},
                // {"name":"French Guiana","code":"GF"},
                // {"name":"French Polynesia","code":"PF"},
                // {"name":"French Southern Territories","code":"TF"},
                // {"name":"Gambia","code":"GM"},
                // {"name":"Gibraltar","code":"GI"},
                // {"name":"Guadeloupe","code":"GP"},
                // {"name":"Guam","code":"GU"},
                // {"name":"Guernsey","code":"GG"},
                // {"name":"Heard Island and Mcdonald Islands","code":"HM"},
                // {"name":"Holy See (Vatican City State)","code":"VA"},
                // {"name":"Hong Kong","code":"HK"},
                // {"name":"Isle of Man","code":"IM"},
                // {"name":"Jersey","code":"JE"},
                // {"name":"Korea, Democratic People'S Republic of","code":"KP"},
                // {"name":"Korea, Republic of","code":"KR"},
                // {"name":"Libyan Arab Jamahiriya","code":"LY"},
                // {"name":"Macao","code":"MO"},
                // {"name":"Martinique","code":"MQ"},
                // {"name":"Mayotte","code":"YT"},
                // {"name":"Micronesia, Federated States of","code":"FM"},
                // {"name":"Montserrat","code":"MS"},
                // {"name":"Netherlands Antilles","code":"AN"},
                // {"name":"New Caledonia","code":"NC"},
                // {"name":"Norfolk Island","code":"NF"},
                // {"name":"Northern Mariana Islands","code":"MP"},
                // {"name":"Palestinian Territory, Occupied","code":"PS"},
                // {"name":"Pitcairn","code":"PN"},
                // {"name":"Puerto Rico","code":"PR"},
                // {"name":"Reunion","code":"RE"},
                // {"name":"Saint Helena","code":"SH"},
                // {"name":"Saint Pierre and Miquelon","code":"PM"},
                // {"name":"Sao Tome and Principe","code":"ST"},
                // {"name":"Serbia and Montenegro","code":"CS"},
                // {"name":"South Georgia and the South Sandwich Islands","code":"GS"},
                // {"name":"Svalbard and Jan Mayen","code":"SJ"},
                // {"name":"Syrian Arab Republic","code":"SY"},
                // {"name":"Tokelau","code":"TK"},
                // {"name":"Turks and Caicos Islands","code":"TC"},
                // {"name":"United States Minor Outlying Islands","code":"UM"},
                // {"name":"Virgin Islands, British","code":"VG"},
                // {"name":"Virgin Islands, U.S.","code":"VI"},
                // {"name":"Wallis and Futuna","code":"WF"},
            ] as Array<{
                name: string,
                code: string,
                url?: string,
                colors: Array<{hex: string, percent?: number}>
            }>,
            options: {
                selectedCountry: "NL",
                ballSize: 32,
                density: 0.001,
                friction: 0.1,
                mass: 1,
                slop: 0.05,
                restitution: 0
            }
        }
    },
    watch: {
        "options.selectedCountry": {
            handler(){
                this.updateImage()
            },
            immediate: true
        },
    },
    mounted() {
        this.updateCanvas()
        window.addEventListener("resize", this.updateCanvas)

        // Selected random starter country
        this.options.selectedCountry = _.shuffle(this.countryList)[0].code
    },
    unmounted() {
        window.removeEventListener("resize", this.updateCanvas)
    },
    methods: {
        updateCanvas() {
            const canvas = this.$el.querySelector("#paperCanvas")
            const el = this.$el.querySelector(".viewport-content")
            
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }

            if (!el) {
                console.error("Can't find element")
                return
            }

            // if (this.paper) {
            //     this.paper.remove()
            // }

            canvas.width = el.clientWidth
            canvas.height = el.clientHeight
            Paper.setup(canvas)
            this.updateImage()
        },
        loadOptions() {
            let options = this.options
            const optionsString = localStorage.getItem("options")
            if (optionsString) {
                this.options = JSON.parse(optionsString)
            }
        },
        updateImage() {
            if (!Paper || !this.$el) {
                return
            }

            if (this.painting.length > 0) {
                _.each(this.painting, p => {
                    p.remove()
                })
                this.painting.length = 0
            }
            const canvas = this.$el.querySelector("#paperCanvas")
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }
            const selectedCountry = _.find(this.countryList, country => {
                return country.code === this.options.selectedCountry
            })
            if (!selectedCountry) {
                console.error("No valid country selected")
                return
            }
            
            const width = canvas.getBoundingClientRect().width
            const height = canvas.getBoundingClientRect().height
            
            // console.log(selectedCountry.colors[0].hex)
            let prev = null as null | paper.Path
            _.each(selectedCountry.colors, (color, index) => {
                let posTL = {x: 0, y: 0}
                let posTR = {x: 0, y: 0}
                let posBR = {x: 0, y: 0}
                let posBL = {x: 0, y: 0}

                if (prev) {
                    posTL.x = prev.segments[1].point.x
                    posBL.x = prev.segments[2].point.x
                }

                const topLeft = new Paper.Point(posTL.x,posTL.y)
                
                let topRight = new Paper.Point(posTL.x + 100/selectedCountry?.colors.length * width/100, 0) 
                if (color.percent) {
                    topRight = new Paper.Point(posTL.x + color.percent * width/100,0)
                } 

                const bottomLeft = new Paper.Point(posBL.x,height)
                
                let bottomRight = new Paper.Point(posBL.x + 100/selectedCountry?.colors.length * width/100, 0) 
                if (color.percent) {
                    bottomRight = new Paper.Point(posBL.x + color.percent * width/100, height)
                } 
                const path = new Paper.Path([
                    topLeft, topRight, bottomRight, bottomLeft
                ])
                path.fillColor = new Paper.Color(color.hex)
                path.closed = true
                console.log(path.segments[2].point)
                prev = path
                this.painting.push(path) 
            })
            // // canvas.height
            // const topLeft = new Paper.Point(0,0)
            // let topRight = new Paper.Point(100/selectedCountry?.colors.length * width/100, 0) 
            // if (selectedCountry.colors[0].percent) {
            //     topRight = new Paper.Point(selectedCountry.colors[0].percent * width/100,0)
            // } 
            // const bottomLeft = new Paper.Point(0,height)
            
            // let bottomRight = new Paper.Point(100/selectedCountry?.colors.length * width/100, 0) 
            // if (selectedCountry.colors[0].percent) {
            //     bottomRight = new Paper.Point(selectedCountry.colors[0].percent * width/100, height)
            // } 
            
            // this.painting.push(new Paper.Path([
            //     topLeft, topRight, bottomRight, bottomLeft
            // ]))
            // this.painting.fillColor = new Paper.Color(selectedCountry.colors[0].hex)
            // this.painting.closed = true
            // console.log(topRight, selectedCountry.colors[0].percent * width/100, selectedCountry.colors[0].percent, width)
            
        }
    }
})
</script>


<style lang="scss" scoped>

    @import '../assets/scss/variables.scss';
    #paperCanvas {
        aspect-ratio: 1/1;
    }
    .scroll-container {
        overflow: hidden;
    }
</style>
