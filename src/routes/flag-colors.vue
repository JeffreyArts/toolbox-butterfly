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
                {"name":"Belgium",                              code: "BE", "colors":[{"hex":"#2D2926","percent":33.34},{"hex":"#FFCD00","percent":33.33},{"hex":"#C8102E","percent":33.33}]},
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
                {"name":"Cambodia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/157px-Flag_of_Cambodia.svg.png","colors":[{"hex":"#032EA1","percent":50},{"hex":"#E00025","percent":39.82},{"hex":"#A49FA0","percent":4.6},{"hex":"#767273","percent":0.56},{"hex":"#A05964","percent":0.25},{"hex":"#752A37","percent":0.12}],"code":"KH"},
                {"name":"Cameroon","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Cameroon.svg/150px-Flag_of_Cameroon.svg.png","colors":[{"hex":"#FCD116","percent":34.59},{"hex":"#007A5E","percent":33.33},{"hex":"#CE1126","percent":31.91},{"hex":"#E6761E","percent":0.17}],"code":"CM"},
                {"name":"Canada","url":"https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Flag_of_Canada.svg/200px-Flag_of_Canada.svg.png","colors":[{"hex":"#FF0000","percent":63.02},{"hex":"#FFFFFF","percent":35.58},{"hex":"#FFD0D0","percent":0.48},{"hex":"#FF9191","percent":0.45},{"hex":"#FF2C2C","percent":0.3},{"hex":"#FF5050","percent":0.19}],"code":"CA"},
                {"name":"Cape Verde","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Cape_Verde.svg/170px-Flag_of_Cape_Verde.svg.png","colors":[{"hex":"#003893","percent":73.59},{"hex":"#FFFFFF","percent":15.1},{"hex":"#CF2027","percent":7},{"hex":"#DF696E","percent":1.99},{"hex":"#F5D017","percent":1.21},{"hex":"#B5A838","percent":0.3}],"code":"CV"},
                {"name":"Cayman Islands",                       code: "KY", "colors":[{"hex":"#EF3340","percent":12},{"hex":"#FFFFFF","percent":12},{"hex":"#00205B","percent":76}]},
                {"name":"Central African Republic","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Central_African_Republic.svg/150px-Flag_of_the_Central_African_Republic.svg.png","colors":[{"hex":"#FFCE00","percent":21.43},{"hex":"#FFFFFF","percent":20.67},{"hex":"#289728","percent":20.67},{"hex":"#003082","percent":19.55},{"hex":"#D21034","percent":16},{"hex":"#CDAF1A","percent":0.13}],"code":"CF"},
                {"name":"Chad","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Flag_of_Chad.svg/150px-Flag_of_Chad.svg.png","colors":[{"hex":"#FECB00","percent":33.33},{"hex":"#002664","percent":33.33},{"hex":"#C60C30","percent":33.33}],"code":"TD"},
                {"name":"Chile","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/150px-Flag_of_Chile.svg.png","colors":[{"hex":"#D52B1E","percent":50},{"hex":"#FFFFFF","percent":34.45},{"hex":"#0039A6","percent":15.3},{"hex":"#3663B9","percent":0.13},{"hex":"#A3B8DF","percent":0.09},{"hex":"#6A8CCB","percent":0.03}],"code":"CL"},
                {"name":"China","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/150px-Flag_of_the_People%27s_Republic_of_China.svg.png","colors":[{"hex":"#DE2910","percent":97.09},{"hex":"#FFDC00","percent":2.46},{"hex":"#EB6F0A","percent":0.45}],"code":"CN"},
                {"name":"Christmas Island",                     code: "CX", "colors":[{"hex":"#0021AD","percent":47},{"hex":"#1C8A42","percent":45},{"hex":"#FFFFFF","percent":1},{"hex":"#FFC639","percent":7}]},
                {"name":"Colombia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/150px-Flag_of_Colombia.svg.png","colors":[{"hex":"#FCD116","percent":50},{"hex":"#003893","percent":25},{"hex":"#CE1126","percent":25}],"code":"CO"},
                {"name":"Comoros","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Flag_of_the_Comoros.svg/167px-Flag_of_the_Comoros.svg.png","colors":[{"hex":"#3A75C4","percent":21.86},{"hex":"#FFC61E","percent":21.81},{"hex":"#3D8E33","percent":21.09},{"hex":"#FFFFFF","percent":18.18},{"hex":"#CE1126","percent":15.59},{"hex":"#709D2E","percent":0.06}],"code":"KM"},
                {"name":"Congo","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_the_Republic_of_the_Congo.svg/150px-Flag_of_the_Republic_of_the_Congo.svg.png","colors":[{"hex":"#009543","percent":33},{"hex":"#DC241F","percent":33},{"hex":"#FBDE4A","percent":32.67},{"hex":"#EC8134","percent":0.67},{"hex":"#7DBA47","percent":0.67}],"code":"CG"},
                {"name":"Cook Islands","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Flag_of_the_Cook_Islands.svg/200px-Flag_of_the_Cook_Islands.svg.png","colors":[{"hex":"#00247D","percent":74.99},{"hex":"#FDFDFE","percent":11.69},{"hex":"#CF142B","percent":8.82},{"hex":"#546CA7","percent":2.18},{"hex":"#304D96","percent":0.5},{"hex":"#DC5364","percent":0.41}],"code":"CK"},
                {"name":"Costa Rica","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Flag_of_Costa_Rica.svg/167px-Flag_of_Costa_Rica.svg.png","colors":[{"hex":"#002B7F","percent":32},{"hex":"#FFFFFF","percent":32},{"hex":"#CE1126","percent":32},{"hex":"#5572AA","percent":2},{"hex":"#DE5F6D","percent":2}],"code":"CR"},
                {"name":"Croatia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Croatia.svg/200px-Flag_of_Croatia.svg.png","colors":[{"hex":"#FF0000","percent":32.58},{"hex":"#171796","percent":32.49},{"hex":"#FFFFFF","percent":28.63},{"hex":"#FD7071","percent":1.19},{"hex":"#B3B3DC","percent":1.02},{"hex":"#9C2639","percent":0.13}],"code":"HR"},
                {"name":"Cuba","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Flag_of_Cuba.svg/200px-Flag_of_Cuba.svg.png","colors":[{"hex":"#002A8F","percent":48.48},{"hex":"#FFFFFF","percent":30.63},{"hex":"#CF142B","percent":19.92},{"hex":"#302578","percent":0.23},{"hex":"#E16B79","percent":0.17},{"hex":"#DA495B","percent":0.17}],"code":"CU"},
                {"name":"Cyprus","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Cyprus.svg/150px-Flag_of_Cyprus.svg.png","colors":[{"hex":"#FFFFFF","percent":88.06},{"hex":"#D47600","percent":8.13},{"hex":"#F0E6D6","percent":1.05},{"hex":"#475429","percent":0.67},{"hex":"#E4A85D","percent":0.35},{"hex":"#DC8E2D","percent":0.25}],"code":"CY"},
                {"name":"Czech Republic","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_Czech_Republic.svg/150px-Flag_of_the_Czech_Republic.svg.png","colors":[{"hex":"#FFFFFF","percent":37.33},{"hex":"#D7141A","percent":37.33},{"hex":"#11457E","percent":24.67},{"hex":"#B0C1D4","percent":0.17},{"hex":"#6083A9","percent":0.17},{"hex":"#95243B","percent":0.17}],"code":"CZ"},
                {"name":"Democratic Republic of the Congo","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/133px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png","colors":[{"hex":"#007FFF","percent":65.81},{"hex":"#CE1021","percent":19.52},{"hex":"#F7D518","percent":11.62},{"hex":"#539CB2","percent":1.25},{"hex":"#E16C1D","percent":0.95},{"hex":"#B1BD59","percent":0.84}]},
                {"name":"Denmark","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Denmark.svg/132px-Flag_of_Denmark.svg.png","colors":[{"hex":"#C60C30","percent":76.86},{"hex":"#FFFFFF","percent":23.12},{"hex":"#D8576F","percent":0.02}],"code":"DK"},
                {"name":"Djibouti","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Flag_of_Djibouti.svg/150px-Flag_of_Djibouti.svg.png","colors":[{"hex":"#6AB2E7","percent":35.61},{"hex":"#12AD2B","percent":35.44},{"hex":"#FFFFFF","percent":27.09},{"hex":"#D7141A","percent":1.24},{"hex":"#E45F63","percent":0.17},{"hex":"#5DC76E","percent":0.11}],"code":"DJ"},
                {"name":"Dominica","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Flag_of_Dominica.svg/200px-Flag_of_Dominica.svg.png","colors":[{"hex":"#000000","percent":8},{"hex":"#D31C30","percent":7.49},{"hex":"#FCD116","percent":7.18},{"hex":"#D4AD13","percent":1.12},{"hex":"#80B59F","percent":1.06},{"hex":"#7E9E2A","percent":1.06}],"code":"DM"},
                {"name":"Dominican Republic","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_the_Dominican_Republic.svg/150px-Flag_of_the_Dominican_Republic.svg.png","colors":[{"hex":"#CE1126","percent":34.8},{"hex":"#002D62","percent":34.77},{"hex":"#FFFFFF","percent":28.84},{"hex":"#358F49","percent":0.17},{"hex":"#9E2228","percent":0.12},{"hex":"#0D7720","percent":0.09}],"code":"DO"},
                {"name":"Ecuador","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Ecuador.svg/150px-Flag_of_Ecuador.svg.png","colors":[{"hex":"#FFDD00","percent":46.95},{"hex":"#ED1C24","percent":25.45},{"hex":"#034EA2","percent":21.57},{"hex":"#483220","percent":1.03},{"hex":"#42AAC9","percent":0.34},{"hex":"#4D9332","percent":0.33}],"code":"EC"},
                {"name":"Egypt","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/150px-Flag_of_Egypt.svg.png","colors":[{"hex":"#000000","percent":33},{"hex":"#CE1126","percent":33},{"hex":"#FFFFFF","percent":28.39},{"hex":"#E4D091","percent":2.16},{"hex":"#EFB0B7","percent":1},{"hex":"#C29608","percent":0.78}],"code":"EG"},
                {"name":"El Salvador","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Flag_of_El_Salvador.svg/178px-Flag_of_El_Salvador.svg.png","colors":[{"hex":"#0F47AF","percent":66.21},{"hex":"#FFFFFF","percent":29.85},{"hex":"#B0C2E5","percent":2.21},{"hex":"#C1B11D","percent":0.12},{"hex":"#258795","percent":0.08},{"hex":"#E27C77","percent":0.04}],"code":"SV"},
                {"name":"Equatorial Guinea","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Equatorial_Guinea.svg/150px-Flag_of_Equatorial_Guinea.svg.png","colors":[{"hex":"#3E9A00","percent":30.22},{"hex":"#E32118","percent":30.22},{"hex":"#FFFFFF","percent":22.73},{"hex":"#0073CE","percent":12.23},{"hex":"#D2D2D1","percent":2.29},{"hex":"#3893BA","percent":0.09}],"code":"GQ"},
                {"name":"Eritrea","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Flag_of_Eritrea.svg/200px-Flag_of_Eritrea.svg.png","colors":[{"hex":"#EA0437","percent":41.72},{"hex":"#12AD2B","percent":24.75},{"hex":"#4189DD","percent":24.75},{"hex":"#F25130","percent":1.57},{"hex":"#F9902B","percent":1.25},{"hex":"#A63979","percent":0.25}],"code":"ER"},
                {"name":"Estonia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Flag_of_Estonia.svg/157px-Flag_of_Estonia.svg.png","colors":[{"hex":"#FFFFFF","percent":33},{"hex":"#4891D9","percent":33},{"hex":"#000000","percent":32},{"hex":"#545454","percent":1},{"hex":"#183048","percent":1}],"code":"EE"},
                {"name":"Ethiopia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/200px-Flag_of_Ethiopia.svg.png","colors":[{"hex":"#078930","percent":29.6},{"hex":"#DA121A","percent":29.59},{"hex":"#FBDD09","percent":23.04},{"hex":"#0F47AF","percent":13.56},{"hex":"#D7C623","percent":0.71},{"hex":"#A12144","percent":0.08}],"code":"ET"},
                {"name":"Fiji","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Fiji.svg/200px-Flag_of_Fiji.svg.png","colors":[{"hex":"#68BFE5","percent":64.99},{"hex":"#CF1129","percent":11.92},{"hex":"#FEFEFE","percent":9.24},{"hex":"#DFD1D5","percent":1.57},{"hex":"#4E6D94","percent":1.34},{"hex":"#B4962A","percent":0.09}],"code":"FJ"},
                {"name":"Finland","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Finland.svg/164px-Flag_of_Finland.svg.png","colors":[{"hex":"#FFFFFF","percent":59.71},{"hex":"#003580","percent":38.2},{"hex":"#5C7EAE","percent":1.66},{"hex":"#8DA5C6","percent":0.44}],"code":"FI"},
                {"name":"France","url":"https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/150px-Flag_of_France.svg.png","colors":[{"hex":"#FFFFFF","percent":33.33},{"hex":"#002395","percent":33.33},{"hex":"#ED2939","percent":33.33}],"code":"FR"},
                {"name":"FS Micronesia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Flag_of_the_Federated_States_of_Micronesia.svg/190px-Flag_of_the_Federated_States_of_Micronesia.svg.png","colors":[{"hex":"#75B2DD","percent":97.43},{"hex":"#FDFEFE","percent":2.01},{"hex":"#D2E6F4","percent":0.56}]},
                {"name":"Gabon","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Flag_of_Gabon.svg/133px-Flag_of_Gabon.svg.png","colors":[{"hex":"#009E60","percent":33},{"hex":"#3A75C4","percent":33},{"hex":"#FCD116","percent":32},{"hex":"#BCB350","percent":1},{"hex":"#A8C02F","percent":1}],"code":"GA"},
                {"name":"Georgia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Georgia.svg/150px-Flag_of_Georgia.svg.png","colors":[{"hex":"#FFFFFF","percent":63.35},{"hex":"#FF0000","percent":34.88},{"hex":"#FF8E8E","percent":0.93},{"hex":"#FF2E2E","percent":0.6},{"hex":"#FFD4D4","percent":0.24}],"code":"GE"},
                {"name":"Germany","url":"https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/167px-Flag_of_Germany.svg.png","colors":[{"hex":"#FFCE00","percent":33},{"hex":"#000000","percent":33},{"hex":"#DD0000","percent":32},{"hex":"#E84500","percent":1},{"hex":"#930000","percent":1}],"code":"DE"},
                {"name":"Ghana","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/150px-Flag_of_Ghana.svg.png","colors":[{"hex":"#006B3F","percent":33},{"hex":"#CE1126","percent":33},{"hex":"#FCD116","percent":29.18},{"hex":"#ED911C","percent":1.13},{"hex":"#A9AF24","percent":1.04},{"hex":"#8C750C","percent":0.13}],"code":"GH"},
                {"name":"Greece","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Greece.svg/150px-Flag_of_Greece.svg.png","colors":[{"hex":"#0D5EAF","percent":52.89},{"hex":"#FFFFFF","percent":41.49},{"hex":"#79A6D3","percent":2.27},{"hex":"#AEC9E4","percent":1.71},{"hex":"#4382C1","percent":1.63}],"code":"GR"},
                {"name":"Greenland",                    code: "GL"},
                {"name":"Grenada","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Grenada.svg/167px-Flag_of_Grenada.svg.png","colors":[{"hex":"#CE1126","percent":39.96},{"hex":"#FCD116","percent":30.65},{"hex":"#007A5E","percent":27.75},{"hex":"#DD6221","percent":0.78},{"hex":"#78A43C","percent":0.62},{"hex":"#992C34","percent":0.02}],"code":"GD"},
                {"name":"Guatemala","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Flag_of_Guatemala.svg/160px-Flag_of_Guatemala.svg.png","colors":[{"hex":"#4997D0","percent":66.25},{"hex":"#FFFFFF","percent":28.57},{"hex":"#C3DDF0","percent":1.93},{"hex":"#EAD98C","percent":0.82},{"hex":"#6B5032","percent":0.21},{"hex":"#C8AD4E","percent":0.06}],"code":"GT"},
                {"name":"Guinea-Bissau","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Guinea-Bissau.svg/200px-Flag_of_Guinea-Bissau.svg.png","colors":[{"hex":"#009E49","percent":33.25},{"hex":"#FCD116","percent":33.25},{"hex":"#CE1126","percent":31.42},{"hex":"#764D35","percent":0.25},{"hex":"#E2631F","percent":0.25},{"hex":"#50070F","percent":0.22}],"code":"GW"},
                {"name":"Guinea","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Flag_of_Guinea.svg/150px-Flag_of_Guinea.svg.png","colors":[{"hex":"#009460","percent":33.33},{"hex":"#CE1126","percent":33.33},{"hex":"#FCD116","percent":33.33}],"code":"GN"},
                {"name":"Guyana","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_Guyana.svg/167px-Flag_of_Guyana.svg.png","colors":[{"hex":"#009E49","percent":49.23},{"hex":"#CE1126","percent":19.43},{"hex":"#FCD116","percent":16.25},{"hex":"#FEFEFD","percent":6.5},{"hex":"#46B97B","percent":0.82},{"hex":"#6B5E24","percent":0.21}],"code":"GY"},
                {"name":"Haiti","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Haiti.svg/167px-Flag_of_Haiti.svg.png","colors":[{"hex":"#00209F","percent":47.53},{"hex":"#D21034","percent":47.53},{"hex":"#1D6D1F","percent":0.41},{"hex":"#A56A25","percent":0.29},{"hex":"#BD9B3F","percent":0.28},{"hex":"#D0504D","percent":0.14}],"code":"HT"},
                {"name":"Honduras","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Flag_of_Honduras.svg/200px-Flag_of_Honduras.svg.png","colors":[{"hex":"#0073CF","percent":66.55},{"hex":"#FFFFFF","percent":30.76},{"hex":"#AAD0EF","percent":2.32},{"hex":"#55A2DF","percent":0.38}],"code":"HN"},
                {"name":"Hungary","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Flag_of_Hungary.svg/200px-Flag_of_Hungary.svg.png","colors":[{"hex":"#436F4D","percent":33},{"hex":"#CD2A3E","percent":33},{"hex":"#FFFFFF","percent":32},{"hex":"#C1D0C4","percent":1},{"hex":"#EEB8BF","percent":1}],"code":"HU"},
                {"name":"Iceland","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Iceland.svg/139px-Flag_of_Iceland.svg.png","colors":[{"hex":"#003897","percent":65.64},{"hex":"#D72828","percent":16.47},{"hex":"#FFFFFF","percent":14.75},{"hex":"#EA8C8C","percent":3.07},{"hex":"#E05757","percent":0.05},{"hex":"#4971B5","percent":0.01}],"code":"IS"},
                {"name":"India","url":"https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/150px-Flag_of_India.svg.png","colors":[{"hex":"#FF9933","percent":33},{"hex":"#128807","percent":33},{"hex":"#FFFFFF","percent":28.97},{"hex":"#B0C07F","percent":1},{"hex":"#07078B","percent":0.68},{"hex":"#3A3AA3","percent":0.47}],"code":"IN"},
                {"name":"Indonesia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/150px-Flag_of_Indonesia.svg.png","colors":[{"hex":"#FFFFFF","percent":50},{"hex":"#CE1126","percent":50}],"code":"ID"},
                {"name":"Iran",                         code: "IR", "colors":[{"hex":"#239F40","percent":32},{"hex":"#FFFFFF","percent":37},{"hex":"#DA0000","percent":31}]},
                {"name":"Iraq","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_Iraq.svg/150px-Flag_of_Iraq.svg.png","colors":[{"hex":"#000000","percent":33},{"hex":"#DCEDE5","percent":30.53},{"hex":"#14844C","percent":1.85},{"hex":"#E9949D","percent":0.99},{"hex":"#459E71","percent":0.33},{"hex":"#84BFA1","percent":0.3}],"code":"IQ"},
                {"name":"Ireland","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/200px-Flag_of_Ireland.svg.png","colors":[{"hex":"#FF883E","percent":33.5},{"hex":"#FFFFFF","percent":33},{"hex":"#169B62","percent":33},{"hex":"#7AC5A5","percent":0.5}],"code":"IE"},
                {"name":"Israel","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Israel.svg/138px-Flag_of_Israel.svg.png","colors":[{"hex":"#FFFFFF","percent":63.14},{"hex":"#0038B8","percent":33.8},{"hex":"#5F82D2","percent":2.5},{"hex":"#D8E1F4","percent":0.41},{"hex":"#88A2DE","percent":0.14}],"code":"IL"},
                {"name":"Italy","url":"https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Flag_of_Italy.svg/150px-Flag_of_Italy.svg.png","colors":[{"hex":"#FFFFFF","percent":33.33},{"hex":"#009246","percent":33.33},{"hex":"#CE2B37","percent":33.33}],"code":"IT"},
                {"name":"Ivory Coast","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/150px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png","colors":[{"hex":"#FFFFFF","percent":33.33},{"hex":"#F77F00","percent":33.33},{"hex":"#009E60","percent":33.33}]},
                {"name":"Jamaica","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Jamaica.svg/200px-Flag_of_Jamaica.svg.png","colors":[{"hex":"#000000","percent":32.8},{"hex":"#009B3A","percent":32.8},{"hex":"#FED100","percent":32.76},{"hex":"#8B7300","percent":0.82},{"hex":"#8AB91A","percent":0.82}],"code":"JM"},
                {"name":"Japan","url":"https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/150px-Flag_of_Japan.svg.png","colors":[{"hex":"#FFFFFF","percent":80.82},{"hex":"#BC002D","percent":18.27},{"hex":"#D14F6E","percent":0.58},{"hex":"#EDBBC7","percent":0.22},{"hex":"#DF869B","percent":0.11}],"code":"JP"},
                {"name":"Jordan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/200px-Flag_of_Jordan.svg.png","colors":[{"hex":"#007A3D","percent":27.39},{"hex":"#000000","percent":27.39},{"hex":"#CE1126","percent":24.14},{"hex":"#FFFFFF","percent":18.66},{"hex":"#D84857","percent":0.27},{"hex":"#972D2C","percent":0.17}],"code":"JO"},
                {"name":"Kazakhstan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kazakhstan.svg/200px-Flag_of_Kazakhstan.svg.png","colors":[{"hex":"#00AFCA","percent":87.48},{"hex":"#FAC50F","percent":6.14},{"hex":"#97BC59","percent":3.56},{"hex":"#2BB3AA","percent":2.84}],"code":"KZ"},
                {"name":"Kenya","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Kenya.svg/150px-Flag_of_Kenya.svg.png","colors":[{"hex":"#000000","percent":30.01},{"hex":"#BB0000","percent":29.39},{"hex":"#006600","percent":28.87},{"hex":"#FFFFFF","percent":9.73},{"hex":"#D56262","percent":0.89},{"hex":"#E6A6A6","percent":0.17}],"code":"KE"},
                {"name":"Kiribati","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kiribati.svg/200px-Flag_of_Kiribati.svg.png","colors":[{"hex":"#CE1126","percent":45.71},{"hex":"#FFFEFF","percent":18.84},{"hex":"#FACF15","percent":5.61},{"hex":"#D0DCE9","percent":1.42},{"hex":"#3768A1","percent":1.42},{"hex":"#8FABCA","percent":1.28}],"code":"KI"},
                {"name":"Kosovo","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Kosovo.svg/140px-Flag_of_Kosovo.svg.png","colors":[{"hex":"#244AA5","percent":87.19},{"hex":"#D0A650","percent":9.8},{"hex":"#FBFCFE","percent":1.33},{"hex":"#A7B7DB","percent":0.46},{"hex":"#748CC6","percent":0.32},{"hex":"#A79064","percent":0.2}]},
                {"name":"Kuwait","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Flag_of_Kuwait.svg/200px-Flag_of_Kuwait.svg.png","colors":[{"hex":"#007A3D","percent":28.84},{"hex":"#CE1126","percent":28.84},{"hex":"#FFFFFF","percent":24.75},{"hex":"#000000","percent":16.59},{"hex":"#EA9AA3","percent":0.75},{"hex":"#890B19","percent":0.08}],"code":"KW"},
                {"name":"Kyrgyzstan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Flag_of_Kyrgyzstan.svg/167px-Flag_of_Kyrgyzstan.svg.png","colors":[{"hex":"#E8112D","percent":90.14},{"hex":"#FFED00","percent":5.26},{"hex":"#F58E14","percent":2.7},{"hex":"#F05A1E","percent":1.89}],"code":"KG"},
                {"name":"Laos","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Laos.svg/150px-Flag_of_Laos.svg.png","colors":[{"hex":"#CE1126","percent":50},{"hex":"#002868","percent":41.37},{"hex":"#FEFFFF","percent":8.17},{"hex":"#879AB8","percent":0.21},{"hex":"#375788","percent":0.15},{"hex":"#ABB8CD","percent":0.11}]},
                {"name":"Latvia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Latvia.svg/200px-Flag_of_Latvia.svg.png","colors":[{"hex":"#9E3039","percent":80},{"hex":"#FFFFFF","percent":20}],"code":"LV"},
                {"name":"Lebanon","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Flag_of_Lebanon.svg/150px-Flag_of_Lebanon.svg.png","colors":[{"hex":"#ED1C24","percent":50},{"hex":"#FFFFFF","percent":42.07},{"hex":"#01A652","percent":5.9},{"hex":"#8ED8B2","percent":0.85},{"hex":"#42BD7E","percent":0.62},{"hex":"#D7F1E4","percent":0.56}],"code":"LB"},
                {"name":"Lesotho","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Flag_of_Lesotho.svg/150px-Flag_of_Lesotho.svg.png","colors":[{"hex":"#FFFFFF","percent":35.98},{"hex":"#00209F","percent":30},{"hex":"#009543","percent":30},{"hex":"#020202","percent":2.43},{"hex":"#2E2E2E","percent":0.42},{"hex":"#4E4E4E","percent":0.26}],"code":"LS"},
                {"name":"Liberia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Flag_of_Liberia.svg/190px-Flag_of_Liberia.svg.png","colors":[{"hex":"#BF0A30","percent":44.06},{"hex":"#FFFFFF","percent":38.85},{"hex":"#002868","percent":9.36},{"hex":"#EAADBA","percent":3.52},{"hex":"#D96C83","percent":1.93},{"hex":"#CA3453","percent":1.48}],"code":"LR"},
                {"name":"Libya","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Libya.svg/200px-Flag_of_Libya.svg.png","colors":[{"hex":"#000000","percent":48.47},{"hex":"#E70013","percent":25},{"hex":"#239E46","percent":25},{"hex":"#727272","percent":0.21},{"hex":"#313131","percent":0.2},{"hex":"#505050","percent":0.11}]},
                {"name":"Liechtenstein","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Flag_of_Liechtenstein.svg/167px-Flag_of_Liechtenstein.svg.png","colors":[{"hex":"#CE1126","percent":50},{"hex":"#002B7F","percent":46.28},{"hex":"#BEA12E","percent":1.09},{"hex":"#F9D33C","percent":0.88},{"hex":"#826E1F","percent":0.74},{"hex":"#524615","percent":0.66}],"code":"LI"},
                {"name":"Lithuania","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Lithuania.svg/167px-Flag_of_Lithuania.svg.png","colors":[{"hex":"#FDB913","percent":33},{"hex":"#C1272D","percent":33},{"hex":"#006A44","percent":32},{"hex":"#40543D","percent":1},{"hex":"#548533","percent":1}],"code":"LT"},
                {"name":"Luxembourg","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Flag_of_Luxembourg.svg/167px-Flag_of_Luxembourg.svg.png","colors":[{"hex":"#00A1DE","percent":33},{"hex":"#ED2939","percent":33},{"hex":"#FFFFFF","percent":32},{"hex":"#F9B8BD","percent":1},{"hex":"#AAE0F4","percent":1}],"code":"LU"},
                {"name":"Macedonia", code:"MK", "url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Flag_of_Macedonia.svg/200px-Flag_of_Macedonia.svg.png","colors":[{"hex":"#D20000","percent":65.35},{"hex":"#FFE600","percent":30.08},{"hex":"#DC3400","percent":2.11},{"hex":"#F4AE00","percent":1.85},{"hex":"#E86F00","percent":0.61}]},
                {"name":"Madagascar","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Madagascar.svg/150px-Flag_of_Madagascar.svg.png","colors":[{"hex":"#FFFFFF","percent":33.33},{"hex":"#007E3A","percent":33.33},{"hex":"#FC3D32","percent":33.33}],"code":"MG"},
                {"name":"Malawi","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Flag_of_Malawi.svg/150px-Flag_of_Malawi.svg.png","colors":[{"hex":"#CE1126","percent":36.31},{"hex":"#339E35","percent":33},{"hex":"#000000","percent":25.81},{"hex":"#550710","percent":2.93},{"hex":"#6D3C23","percent":1},{"hex":"#8F0C1A","percent":0.95}],"code":"MW"},
                {"name":"Malaysia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Flag_of_Malaysia.svg/200px-Flag_of_Malaysia.svg.png","colors":[{"hex":"#CC0001","percent":34},{"hex":"#FFFFFF","percent":32.5},{"hex":"#010066","percent":23.35},{"hex":"#E26E6F","percent":3},{"hex":"#F1B7B7","percent":2},{"hex":"#D4A911","percent":0.81}],"code":"MY"},
                {"name":"Maldives","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Maldives.svg/150px-Flag_of_Maldives.svg.png","colors":[{"hex":"#D21034","percent":66.67},{"hex":"#007E3A","percent":31.69},{"hex":"#C9E4D5","percent":0.27},{"hex":"#6FB690","percent":0.15},{"hex":"#379A64","percent":0.06},{"hex":"#29935A","percent":0.06}],"code":"MV"},
                {"name":"Mali","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/150px-Flag_of_Mali.svg.png","colors":[{"hex":"#14B53A","percent":33.33},{"hex":"#CE1126","percent":33.33},{"hex":"#FCD116","percent":33.33}],"code":"ML"},
                {"name":"Malta","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Malta.svg/150px-Flag_of_Malta.svg.png","colors":[{"hex":"#CF142B","percent":50},{"hex":"#FFFFFF","percent":47},{"hex":"#A9A29C","percent":0.96},{"hex":"#F6A9B5","percent":0.49},{"hex":"#D36773","percent":0.07},{"hex":"#6F6E6E","percent":0.01}],"code":"MT"},
                {"name":"Marshall Islands","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_the_Marshall_Islands.svg/190px-Flag_of_the_Marshall_Islands.svg.png","colors":[{"hex":"#003893","percent":73.03},{"hex":"#FEFEFE","percent":12.23},{"hex":"#DD7500","percent":9.99},{"hex":"#CCD7E9","percent":1.31},{"hex":"#2958A4","percent":1.25},{"hex":"#90A8D0","percent":1.09}],"code":"MH"},
                {"name":"Mauritania","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Flag_of_Mauritania.svg/150px-Flag_of_Mauritania.svg.png","colors":[{"hex":"#006233","percent":93.78},{"hex":"#FFC400","percent":4.7},{"hex":"#477D25","percent":0.98},{"hex":"#B4A70F","percent":0.54}],"code":"MR"},
                {"name":"Mauritius","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Mauritius.svg/150px-Flag_of_Mauritius.svg.png","colors":[{"hex":"#FFD500","percent":25},{"hex":"#00A551","percent":25},{"hex":"#EA2839","percent":25},{"hex":"#1A206D","percent":25}],"code":"MU"},
                {"name":"Mexico","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/175px-Flag_of_Mexico.svg.png","colors":[{"hex":"#006847","percent":33.15},{"hex":"#CE1126","percent":33.15},{"hex":"#FFFFFF","percent":26.74},{"hex":"#EFB1B7","percent":1.23},{"hex":"#593520","percent":1.12},{"hex":"#925A2F","percent":0.46}],"code":"MX"},
                {"name":"Moldova", code: "MD","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/200px-Flag_of_Moldova.svg.png","colors":[{"hex":"#CC092F","percent":33.72},{"hex":"#0046AE","percent":33.52},{"hex":"#FFD200","percent":25.17},{"hex":"#352815","percent":1.78},{"hex":"#AD7D54","percent":1.72},{"hex":"#674F21","percent":1.01}]},
                {"name":"Monaco","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Flag_of_Monaco.svg/125px-Flag_of_Monaco.svg.png","colors":[{"hex":"#FFFFFF","percent":50},{"hex":"#CE1126","percent":50}],"code":"MC"},
                {"name":"Mongolia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flag_of_Mongolia.svg/200px-Flag_of_Mongolia.svg.png","colors":[{"hex":"#C4272F","percent":58.68},{"hex":"#015197","percent":33},{"hex":"#F9CF02","percent":5.42},{"hex":"#833551","percent":1},{"hex":"#E69511","percent":0.99},{"hex":"#D66120","percent":0.91}],"code":"MN"},
                {"name":"Montenegro","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Montenegro.svg/200px-Flag_of_Montenegro.svg.png","colors":[{"hex":"#C40308","percent":76.94},{"hex":"#D3AD3B","percent":21.23},{"hex":"#C4722A","percent":0.81},{"hex":"#1D5E91","percent":0.43},{"hex":"#6E8B3E","percent":0.42},{"hex":"#626765","percent":0.18}]},
                {"name":"Morocco","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/150px-Flag_of_Morocco.svg.png","colors":[{"hex":"#C1272D","percent":97.97},{"hex":"#016233","percent":1.54},{"hex":"#684230","percent":0.49}],"code":"MA"},
                {"name":"Mozambique","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Flag_of_Mozambique.svg/150px-Flag_of_Mozambique.svg.png","colors":[{"hex":"#FCE100","percent":27.92},{"hex":"#007168","percent":26.66},{"hex":"#000000","percent":19.46},{"hex":"#D21034","percent":17.48},{"hex":"#D05B28","percent":0.33},{"hex":"#B1A33E","percent":0.12}],"code":"MZ"},
                {"name":"Myanmar","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_of_Myanmar.svg/150px-Flag_of_Myanmar.svg.png","colors":[{"hex":"#FECB00","percent":32.32},{"hex":"#EA2839","percent":31.06},{"hex":"#34B233","percent":24.47},{"hex":"#FEFFFE","percent":9.6},{"hex":"#77BA22","percent":0.92},{"hex":"#708435","percent":0.77}],"code":"MM"},
                {"name":"Nagorno-Karabakh Republic","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Flag_of_Nagorno-Karabakh.svg/200px-Flag_of_Nagorno-Karabakh.svg.png","colors":[{"hex":"#F2A800","percent":27.83},{"hex":"#D90012","percent":27.82},{"hex":"#0033A0","percent":27.06},{"hex":"#FFFFFF","percent":14},{"hex":"#482271","percent":0.78},{"hex":"#E13947","percent":0.33}]},
                {"name":"Namibia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Namibia.svg/150px-Flag_of_Namibia.svg.png","colors":[{"hex":"#009543","percent":31.77},{"hex":"#003580","percent":27.84},{"hex":"#D21034","percent":27.2},{"hex":"#FEFDFD","percent":7.13},{"hex":"#FECD01","percent":2.14},{"hex":"#E05D75","percent":0.55}],"code":"NA"},
                {"name":"Nauru","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Flag_of_Nauru.svg/200px-Flag_of_Nauru.svg.png","colors":[{"hex":"#002B7F","percent":87.47},{"hex":"#FFC61E","percent":8},{"hex":"#334A6C","percent":2.11},{"hex":"#FEFEFE","percent":1.87},{"hex":"#738AB9","percent":0.31},{"hex":"#9AABCC","percent":0.25}],"code":"NR"},
                {"name":"Nepal","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_of_Nepal.svg/164px-Flag_of_Nepal.svg.png","colors":[{"hex":"#003A96","percent":54.65},{"hex":"#DC143C","percent":35.93},{"hex":"#FFFEFE","percent":7.68},{"hex":"#EA728A","percent":0.42},{"hex":"#F099AA","percent":0.36},{"hex":"#63286C","percent":0.11}],"code":"NP"},
                {"name":"Netherlands, the",                          code: "NL", "colors":[{"hex":"#C8102E","percent":33.333},{"hex":"#FFFFFF","percent":33.333},{"hex":"#003DA5","percent":33.333}]},
                {"name":"New Zealand","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/200px-Flag_of_New_Zealand.svg.png","colors":[{"hex":"#00247D","percent":79.32},{"hex":"#CC142B","percent":9.25},{"hex":"#FEFDFE","percent":7.18},{"hex":"#546CA8","percent":1.48},{"hex":"#DDD9E6","percent":1.34},{"hex":"#2E4B95","percent":0.2}],"code":"NZ"},
                {"name":"Nicaragua","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Nicaragua.svg/167px-Flag_of_Nicaragua.svg.png","colors":[{"hex":"#0067C6","percent":66},{"hex":"#FFFFFF","percent":29.68},{"hex":"#ABCDEC","percent":2.29},{"hex":"#98C826","percent":0.22},{"hex":"#D0DB25","percent":0.1},{"hex":"#CF2425","percent":0.02}],"code":"NI"},
                {"name":"Niger","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Flag_of_Niger.svg/117px-Flag_of_Niger.svg.png","colors":[{"hex":"#E05206","percent":38.21},{"hex":"#0DB02B","percent":33},{"hex":"#FFFFFF","percent":26.51},{"hex":"#F5C5AC","percent":1.02},{"hex":"#AFE5B9","percent":1},{"hex":"#EEA279","percent":0.26}],"code":"NE"},
                {"name":"Nigeria","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_Nigeria.svg/200px-Flag_of_Nigeria.svg.png","colors":[{"hex":"#008751","percent":66},{"hex":"#FFFFFF","percent":33},{"hex":"#5AB18E","percent":1}],"code":"NG"},
                {"name":"Niue","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Niue.svg/200px-Flag_of_Niue.svg.png","colors":[{"hex":"#FCD116","percent":75.8},{"hex":"#FEFEFE","percent":7.05},{"hex":"#CF142B","percent":7.03},{"hex":"#002868","percent":6.73},{"hex":"#506B97","percent":1.23},{"hex":"#D95F25","percent":0.19}],"code":"NU"},
                {"name":"North Korea",                               code: "KP", "colors":[{"hex":"#024FA2","percent":33},{"hex":"#FFFFFF","percent":11},{"hex":"#ED1C27","percent":56}]},
                {"name":"Northern Cyprus","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg/150px-Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg.png","colors":[{"hex":"#FFFFFF","percent":73.57},{"hex":"#E30A17","percent":25.28},{"hex":"#EA4B55","percent":0.92},{"hex":"#F6AEB2","percent":0.23}]},
                {"name":"Norway","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Norway.svg/138px-Flag_of_Norway.svg.png","colors":[{"hex":"#EF2B2D","percent":60.06},{"hex":"#002868","percent":19.65},{"hex":"#FFFFFF","percent":15.13},{"hex":"#F68E8F","percent":2.16},{"hex":"#BBC6D7","percent":1.81},{"hex":"#637CA3","percent":0.01}],"code":"NO"},
                {"name":"Oman","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Flag_of_Oman.svg/200px-Flag_of_Oman.svg.png","colors":[{"hex":"#DB161B","percent":47.35},{"hex":"#FFFFFF","percent":25.82},{"hex":"#008000","percent":24.75},{"hex":"#E76669","percent":0.91},{"hex":"#923A12","percent":0.75},{"hex":"#F3B0B2","percent":0.43}],"code":"OM"},
                {"name":"Pakistan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/150px-Flag_of_Pakistan.svg.png","colors":[{"hex":"#01411C","percent":67.65},{"hex":"#FFFFFF","percent":30.16},{"hex":"#82A18F","percent":1.16},{"hex":"#DDE6E1","percent":0.46},{"hex":"#47755A","percent":0.33},{"hex":"#235A3A","percent":0.24}],"code":"PK"},
                {"name":"Palau","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Palau.svg/160px-Flag_of_Palau.svg.png","colors":[{"hex":"#4AADD6","percent":82.04},{"hex":"#FFDE00","percent":17.13},{"hex":"#D4D233","percent":0.54},{"hex":"#74B9A5","percent":0.15},{"hex":"#9AC377","percent":0.13}],"code":"PW"},
                {"name":"Panama","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Flag_of_Panama.svg/150px-Flag_of_Panama.svg.png","colors":[{"hex":"#FFFFFF","percent":47.39},{"hex":"#005293","percent":26.07},{"hex":"#D21034","percent":26.06},{"hex":"#EA90A1","percent":0.16},{"hex":"#5088B5","percent":0.09},{"hex":"#DF536D","percent":0.07}],"code":"PA"},
                {"name":"Papua New Guinea","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Flag_of_Papua_New_Guinea.svg/133px-Flag_of_Papua_New_Guinea.svg.png","colors":[{"hex":"#000000","percent":47.39},{"hex":"#CE1126","percent":43.76},{"hex":"#FCD016","percent":4.71},{"hex":"#EC8F1B","percent":0.98},{"hex":"#DC4D21","percent":0.41},{"hex":"#6E0914","percent":0.33}],"code":"PG"},
                {"name":"Paraguay","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Paraguay.svg/182px-Flag_of_Paraguay.svg.png","colors":[{"hex":"#0038A8","percent":33},{"hex":"#D52B1E","percent":33},{"hex":"#FFFFFF","percent":29.89},{"hex":"#ABBDE2","percent":1.82},{"hex":"#F1B8B4","percent":1.03},{"hex":"#309556","percent":0.17}],"code":"PY"},
                {"name":"Peru","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru.svg/150px-Flag_of_Peru.svg.png","colors":[{"hex":"#D91023","percent":66.67},{"hex":"#FFFFFF","percent":33.33}],"code":"PE"},
                {"name":"Philippines","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_the_Philippines.svg/200px-Flag_of_the_Philippines.svg.png","colors":[{"hex":"#CE1126","percent":39.07},{"hex":"#0038A8","percent":39.01},{"hex":"#FFFFFE","percent":16.54},{"hex":"#FCD116","percent":2.68},{"hex":"#FEEFAD","percent":1.21},{"hex":"#698ACC","percent":0.11}],"code":"PH"},
                {"name":"Poland","url":"https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Flag_of_Poland.svg/160px-Flag_of_Poland.svg.png","colors":[{"hex":"#FFFFFF","percent":50},{"hex":"#DC143C","percent":50}],"code":"PL"},
                {"name":"Portugal","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/150px-Flag_of_Portugal.svg.png","colors":[{"hex":"#FF0000","percent":55.75},{"hex":"#006600","percent":34.19},{"hex":"#959E01","percent":2.6},{"hex":"#FDFDFE","percent":1.47},{"hex":"#2F59AC","percent":0.43},{"hex":"#BA5F41","percent":0.05}],"code":"PT"},
                {"name":"Qatar","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Qatar.svg/255px-Flag_of_Qatar.svg.png","colors":[{"hex":"#8D1B3D","percent":66.21},{"hex":"#FFFFFF","percent":32.75},{"hex":"#B2657D","percent":0.56},{"hex":"#E5CAD2","percent":0.48}],"code":"QA"},
                {"name":"Romania","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Romania.svg/150px-Flag_of_Romania.svg.png","colors":[{"hex":"#002B7F","percent":33.33},{"hex":"#CE1126","percent":33.33},{"hex":"#FCD116","percent":33.33}],"code":"RO"},
                {"name":"Russia",                                   code:"RU", "colors":[{"hex":"#FFFFFF","percent":33.33},{"hex":"#1C3578","percent":33.34},{"hex":"#E4181C","percent":33.33}]},
                {"name":"Rwanda","code":"RW","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Flag_of_Rwanda.svg/150px-Flag_of_Rwanda.svg.png","colors":[{"hex":"#00A1DE","percent":47.41},{"hex":"#FAD201","percent":25.51},{"hex":"#20603D","percent":25},{"hex":"#81B162","percent":1.21},{"hex":"#40A9A0","percent":0.73},{"hex":"#C2BA22","percent":0.15}]},
                {"name":"Sahrawi Arab Democratic Republic","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg/200px-Flag_of_the_Sahrawi_Arab_Democratic_Republic.svg.png","colors":[{"hex":"#000000","percent":29.33},{"hex":"#007A3D","percent":29.32},{"hex":"#FFFFFF","percent":21.4},{"hex":"#C4111B","percent":17.33},{"hex":"#CE3A42","percent":0.31},{"hex":"#DA6B71","percent":0.12}]},
                {"name":"Saint Kitts and Nevis","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Saint_Kitts_and_Nevis.svg/150px-Flag_of_Saint_Kitts_and_Nevis.svg.png","colors":[{"hex":"#000000","percent":28.72},{"hex":"#CE1126","percent":27.87},{"hex":"#009E49","percent":27.63},{"hex":"#FBD116","percent":10.48},{"hex":"#292929","percent":0.21},{"hex":"#474747","percent":0.18}],"code":"KN"},
                {"name":"Saint Lucia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Saint_Lucia.svg/200px-Flag_of_Saint_Lucia.svg.png","colors":[{"hex":"#66CCFF","percent":85.93},{"hex":"#FCD116","percent":6.68},{"hex":"#FDFEFE","percent":3.02},{"hex":"#665509","percent":0.09},{"hex":"#AD900F","percent":0.08},{"hex":"#FDDD56","percent":0.03}],"code":"LC"},
                {"name":"Saint Vincent and the Grenadines","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Flag_of_Saint_Vincent_and_the_Grenadines.svg/150px-Flag_of_Saint_Vincent_and_the_Grenadines.svg.png","colors":[{"hex":"#FCD116","percent":43.57},{"hex":"#009E60","percent":29.79},{"hex":"#0072C6","percent":24.67},{"hex":"#7EB83B","percent":1.31},{"hex":"#7EA16E","percent":0.67}],"code":"VC"},
                {"name":"Samoa","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Samoa.svg/200px-Flag_of_Samoa.svg.png","colors":[{"hex":"#CE1126","percent":75},{"hex":"#002B7F","percent":23.66},{"hex":"#FBFCFD","percent":0.72},{"hex":"#2F5297","percent":0.33},{"hex":"#6D86B6","percent":0.21},{"hex":"#BAC6DC","percent":0.1}],"code":"WS"},
                {"name":"San Marino","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Flag_of_San_Marino.svg/133px-Flag_of_San_Marino.svg.png","colors":[{"hex":"#FFFFFF","percent":43.67},{"hex":"#5EB6E4","percent":42.98},{"hex":"#86681D","percent":2.69},{"hex":"#364B36","percent":2.56},{"hex":"#D7A42E","percent":1.16},{"hex":"#9CCBE7","percent":1.04}],"code":"SM"},
                {"name":"São Tomé and Príncipe","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Sao_Tome_and_Principe.svg/200px-Flag_of_Sao_Tome_and_Principe.svg.png","colors":[{"hex":"#12AD2B","percent":51.94},{"hex":"#FFCE00","percent":30.83},{"hex":"#D21034","percent":12.25},{"hex":"#78BB18","percent":1.71},{"hex":"#725E2F","percent":0.28},{"hex":"#E86F1A","percent":0.21}]},
                {"name":"Saudi Arabia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/150px-Flag_of_Saudi_Arabia.svg.png","colors":[{"hex":"#006C35","percent":90.27},{"hex":"#FBFDFC","percent":5.12},{"hex":"#8BBCA3","percent":1.73},{"hex":"#4C9872","percent":1.73},{"hex":"#B7D5C6","percent":1.15}],"code":"SA"},
                {"name":"Senegal","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/150px-Flag_of_Senegal.svg.png","colors":[{"hex":"#00853F","percent":35.23},{"hex":"#E31B23","percent":33.33},{"hex":"#FDEF42","percent":31.15},{"hex":"#71B540","percent":0.22},{"hex":"#ABCD41","percent":0.07}],"code":"SN"},
                {"name":"Serbia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Flag_of_Serbia.svg/150px-Flag_of_Serbia.svg.png","colors":[{"hex":"#C6363C","percent":32.76},{"hex":"#0C4076","percent":23.68},{"hex":"#CF9E2E","percent":2.04},{"hex":"#B06232","percent":1.11},{"hex":"#CFA6A5","percent":1.09},{"hex":"#5C7FA3","percent":1.01}]},
                {"name":"Seychelles","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Seychelles.svg/200px-Flag_of_Seychelles.svg.png","colors":[{"hex":"#D62828","percent":32.68},{"hex":"#003F87","percent":16.5},{"hex":"#007A3D","percent":16.34},{"hex":"#FCD856","percent":16.34},{"hex":"#FFFEFE","percent":16.04},{"hex":"#3B996A","percent":0.33}],"code":"SC"},
                {"name":"Sierra Leone","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Flag_of_Sierra_Leone.svg/150px-Flag_of_Sierra_Leone.svg.png","colors":[{"hex":"#0072C6","percent":33},{"hex":"#1EB53A","percent":33},{"hex":"#FFFFFF","percent":32},{"hex":"#B4E6BD","percent":1},{"hex":"#ABD1EC","percent":1}],"code":"SL"},
                {"name":"Singapore","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/150px-Flag_of_Singapore.svg.png","colors":[{"hex":"#FFFFFF","percent":52.18},{"hex":"#ED2939","percent":46.69},{"hex":"#F58C94","percent":0.57},{"hex":"#FBCCD0","percent":0.55}],"code":"SG"},
                {"name":"Slovakia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Flag_of_Slovakia.svg/150px-Flag_of_Slovakia.svg.png","colors":[{"hex":"#EE1C25","percent":38.12},{"hex":"#FFFFFF","percent":32.98},{"hex":"#0B4EA2","percent":25.46},{"hex":"#5C89C1","percent":0.89},{"hex":"#F24C53","percent":0.49},{"hex":"#9B2E53","percent":0.03}],"code":"SK"},
                {"name":"Slovenia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Flag_of_Slovenia.svg/200px-Flag_of_Slovenia.svg.png","colors":[{"hex":"#ED1C24","percent":33.19},{"hex":"#005DA4","percent":32.27},{"hex":"#FFFFFF","percent":31.72},{"hex":"#5593C2","percent":1.23},{"hex":"#4E477A","percent":1.12},{"hex":"#B7B92E","percent":0.02}],"code":"SI"},
                {"name":"Solomon Islands","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Flag_of_the_Solomon_Islands.svg/200px-Flag_of_the_Solomon_Islands.svg.png","colors":[{"hex":"#215B33","percent":44.65},{"hex":"#0051BA","percent":40.99},{"hex":"#FCD116","percent":8.8},{"hex":"#FDFEFE","percent":2.51},{"hex":"#C3B21D","percent":0.95},{"hex":"#2F71C7","percent":0.72}],"code":"SB"},
                {"name":"Somalia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Somalia.svg/150px-Flag_of_Somalia.svg.png","colors":[{"hex":"#4189DD","percent":95.29},{"hex":"#FEFFFF","percent":4.1},{"hex":"#9AC0ED","percent":0.61}],"code":"SO"},
                {"name":"Somaliland","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Flag_of_Somaliland.svg/200px-Flag_of_Somaliland.svg.png","colors":[{"hex":"#020202","percent":94.58},{"hex":"#006D21","percent":5.13},{"hex":"#9B9F9C","percent":0.25},{"hex":"#2C2C2C","percent":0.03},{"hex":"#6D6D6D","percent":0.02}]},
                {"name":"South Africa","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_South_Africa.svg/150px-Flag_of_South_Africa.svg.png","colors":[{"hex":"#007A4D","percent":30.66},{"hex":"#002395","percent":20.85},{"hex":"#DE3831","percent":20.85},{"hex":"#FEFEFE","percent":11.04},{"hex":"#000000","percent":8.8},{"hex":"#FDB512","percent":4.97}],"code":"ZA"},
                {"name":"South Korea",                              code: "KR", "colors":[{"hex":"#CD2E3A","percent":7},{"hex":"#0F64CD","percent":7},{"hex":"#FFFFFF","percent":78},{"hex":"#000000","percent":8}]},
                {"name":"South Ossetia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Flag_of_South_Ossetia.svg/200px-Flag_of_South_Ossetia.svg.png","colors":[{"hex":"#FFFFFF","percent":33},{"hex":"#FFDF00","percent":33},{"hex":"#FF0000","percent":32},{"hex":"#FF5454","percent":1},{"hex":"#FF8238","percent":1}]},
                {"name":"South Sudan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_South_Sudan.svg/200px-Flag_of_South_Sudan.svg.png","colors":[{"hex":"#078930","percent":26.16},{"hex":"#000000","percent":26.06},{"hex":"#0F47AF","percent":19.89},{"hex":"#DA121A","percent":18.88},{"hex":"#FFFFFF","percent":7.15},{"hex":"#FBDC0A","percent":1.36}]},
                {"name":"Spain","url":"https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/150px-Flag_of_Spain.svg.png","colors":[{"hex":"#C60B1E","percent":50.01},{"hex":"#FFC400","percent":43.6},{"hex":"#975C11","percent":1.74},{"hex":"#9E2918","percent":1.37},{"hex":"#B08F07","percent":1.29},{"hex":"#CEB56B","percent":0.18}],"code":"ES"},
                {"name":"Sri Lanka","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Sri_Lanka.svg/200px-Flag_of_Sri_Lanka.svg.png","colors":[{"hex":"#FEB700","percent":38.32},{"hex":"#8D2029","percent":32.72},{"hex":"#005641","percent":11.07},{"hex":"#552D0A","percent":2.75},{"hex":"#B88301","percent":1.37},{"hex":"#B3511B","percent":1.29}],"code":"LK"},
                {"name":"State of Palestine","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/200px-Flag_of_Palestine.svg.png","colors":[{"hex":"#007A3D","percent":29.32},{"hex":"#000000","percent":29.32},{"hex":"#FFFFFF","percent":22.93},{"hex":"#CE1126","percent":16.46},{"hex":"#D63849","percent":0.07},{"hex":"#E16C79","percent":0.05}]},
                {"name":"Sudan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Sudan.svg/200px-Flag_of_Sudan.svg.png","colors":[{"hex":"#000000","percent":29.42},{"hex":"#D21034","percent":29.33},{"hex":"#FFFFFF","percent":22.93},{"hex":"#007229","percent":16.46},{"hex":"#2A894C","percent":0.07},{"hex":"#7E382F","percent":0.04}],"code":"SD"},
                {"name":"Suriname","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Flag_of_Suriname.svg/150px-Flag_of_Suriname.svg.png","colors":[{"hex":"#377E3F","percent":40},{"hex":"#B40A2D","percent":36.57},{"hex":"#FFFFFF","percent":20},{"hex":"#ECC81D","percent":2.87},{"hex":"#C33B29","percent":0.44},{"hex":"#D16E25","percent":0.12}],"code":"SR"},
                {"name":"Swaziland","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Flag_of_Swaziland.svg/150px-Flag_of_Swaziland.svg.png","colors":[{"hex":"#3E5EB9","percent":37.53},{"hex":"#B10C0C","percent":32.4},{"hex":"#FED800","percent":12.67},{"hex":"#FEFEFE","percent":5.25},{"hex":"#020202","percent":5.11},{"hex":"#5E5C61","percent":1.08}],"code":"SZ"},
                {"name":"Sweden","url":"https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Flag_of_Sweden.svg/160px-Flag_of_Sweden.svg.png","colors":[{"hex":"#006AA7","percent":70},{"hex":"#FECC00","percent":30}],"code":"SE"},
                {"name":"Switzerland","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Switzerland.svg/100px-Flag_of_Switzerland.svg.png","colors":[{"hex":"#FF0000","percent":78.48},{"hex":"#FFFFFF","percent":19.08},{"hex":"#FF6060","percent":2.4},{"hex":"#FF9C9C","percent":0.04}],"code":"CH"},
                {"name":"Syria",                                    code: "SY","colors":[{"hex":"#CE1126","percent":33.5},{"hex":"#FFFFFF","percent":30},{"hex":"#007A3D","percent":3},{"hex":"#000000","percent":33.5}]},
                {"name":"Taiwan",                                   code: "TW","colors":[{"hex":"#FE0000","percent":75},{"hex":"#000095","percent":22},{"hex":"#FEFEFE","percent":3}]},
                {"name":"Tajikistan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Flag_of_Tajikistan.svg/200px-Flag_of_Tajikistan.svg.png","colors":[{"hex":"#FFFFFF","percent":40},{"hex":"#006600","percent":28},{"hex":"#CC0000","percent":28},{"hex":"#F8C405","percent":1.12},{"hex":"#6EA86E","percent":1},{"hex":"#E26D6D","percent":1}],"code":"TJ"},
                {"name":"Tanzania",                                 code: "TZ", "colors":[{"hex":"#1EB53A","percent":29},{"hex":"#FCD116","percent":12},{"hex":"#000000","percent":30},{"hex":"#00A3DD","percent":29}]},
                {"name":"Thailand","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/150px-Flag_of_Thailand.svg.png","colors":[{"hex":"#FFFFFF","percent":32},{"hex":"#241D4F","percent":32},{"hex":"#ED1C24","percent":32},{"hex":"#6D688A","percent":2},{"hex":"#F3686D","percent":2}],"code":"TH"},
                {"name":"the Gambia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_The_Gambia.svg/150px-Flag_of_The_Gambia.svg.png","colors":[{"hex":"#CE1126","percent":33},{"hex":"#3A7728","percent":33},{"hex":"#0C1C8C","percent":22},{"hex":"#FFFFFF","percent":10},{"hex":"#BDD2B7","percent":1},{"hex":"#D0C2D7","percent":1}]},
                {"name":"Timor-Leste","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Flag_of_East_Timor.svg/200px-Flag_of_East_Timor.svg.png","colors":[{"hex":"#DC241F","percent":75},{"hex":"#000000","percent":14.35},{"hex":"#FFC726","percent":8.08},{"hex":"#5D490E","percent":0.17},{"hex":"#A17E18","percent":0.16},{"hex":"#D2A41F","percent":0.09}],"code":"TL"},
                {"name":"Togo","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flag_of_Togo.svg/162px-Flag_of_Togo.svg.png","colors":[{"hex":"#006A4E","percent":45.17},{"hex":"#FFCE00","percent":32.59},{"hex":"#D21034","percent":19.6},{"hex":"#FFFDFD","percent":2.38},{"hex":"#F2BAC4","percent":0.15},{"hex":"#E2647B","percent":0.1}],"code":"TG"},
                {"name":"Tonga","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Tonga.svg/200px-Flag_of_Tonga.svg.png","colors":[{"hex":"#C10000","percent":82.66},{"hex":"#FFFFFF","percent":16.54},{"hex":"#D65555","percent":0.49},{"hex":"#EFBFBF","percent":0.24},{"hex":"#E49090","percent":0.07}],"code":"TO"},
                {"name":"Trinidad and Tobago","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Trinidad_and_Tobago.svg/167px-Flag_of_Trinidad_and_Tobago.svg.png","colors":[{"hex":"#CE1126","percent":68.95},{"hex":"#000000","percent":19.65},{"hex":"#FEFDFE","percent":9.19},{"hex":"#DF6371","percent":0.34},{"hex":"#E78893","percent":0.32},{"hex":"#EEADB4","percent":0.16}],"code":"TT"},
                {"name":"Tunisia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Tunisia.svg/150px-Flag_of_Tunisia.svg.png","colors":[{"hex":"#E70013","percent":89.93},{"hex":"#FFFEFE","percent":8.77},{"hex":"#F16C77","percent":1.01},{"hex":"#F7ADB4","percent":0.21},{"hex":"#EC3847","percent":0.09}],"code":"TN"},
                {"name":"Turkey","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/150px-Flag_of_Turkey.svg.png","colors":[{"hex":"#E30A17","percent":93.37},{"hex":"#FFFEFE","percent":5.2},{"hex":"#F9CDD0","percent":0.57},{"hex":"#EF7279","percent":0.57},{"hex":"#EA4953","percent":0.29}],"code":"TR"},
                {"name":"Turkmenistan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Turkmenistan.svg/150px-Flag_of_Turkmenistan.svg.png","colors":[{"hex":"#28AE66","percent":82.73},{"hex":"#C93745","percent":9.52},{"hex":"#B47134","percent":4.13},{"hex":"#60654E","percent":1.11},{"hex":"#65BE8E","percent":0.46},{"hex":"#AE915A","percent":0.2}],"code":"TM"},
                {"name":"Tuvalu","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tuvalu.svg/200px-Flag_of_Tuvalu.svg.png","colors":[{"hex":"#5B97B1","percent":72.24},{"hex":"#CF142B","percent":8.82},{"hex":"#FEFEFE","percent":7.16},{"hex":"#00247D","percent":6.2},{"hex":"#FCCD03","percent":2.95},{"hex":"#B2B452","percent":1.03}],"code":"TV"},
                {"name":"Uganda","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Flag_of_Uganda.svg/150px-Flag_of_Uganda.svg.png","colors":[{"hex":"#FCDC04","percent":32.01},{"hex":"#000000","percent":29.55},{"hex":"#D90000","percent":29.43},{"hex":"#FEFDFD","percent":3.24},{"hex":"#544901","percent":2},{"hex":"#C4A636","percent":0.02}],"code":"UG"},
                {"name":"Ukraine","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/150px-Flag_of_Ukraine.svg.png","colors":[{"hex":"#FFD500","percent":50},{"hex":"#005BBB","percent":50}],"code":"UA"},
                {"name":"United Arab Emirates","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/200px-Flag_of_the_United_Arab_Emirates.svg.png","colors":[{"hex":"#FF0000","percent":25},{"hex":"#FFFFFF","percent":24.75},{"hex":"#000000","percent":24.75},{"hex":"#00732F","percent":24.75},{"hex":"#929292","percent":0.75}],"code":"AE"},
                {"name":"United Kingdom","url":"https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/200px-Flag_of_the_United_Kingdom.svg.png","colors":[{"hex":"#CF142B","percent":36.09},{"hex":"#FFFFFF","percent":31.36},{"hex":"#F3C4CA","percent":1.54},{"hex":"#AAB6D4","percent":1.48},{"hex":"#DB4F60","percent":1.25},{"hex":"#6E82B5","percent":1.04}],"code":"GB"},
                {"name":"United States","url":"https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/190px-Flag_of_the_United_States.svg.png","colors":[{"hex":"#B22234","percent":37.2},{"hex":"#FEFEFE","percent":33.99},{"hex":"#3C3B6E","percent":18.11},{"hex":"#CA6673","percent":4.4},{"hex":"#EDCDD1","percent":3.18},{"hex":"#DC9AA2","percent":1.6}],"code":"US"},
                {"name":"Uruguay","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/150px-Flag_of_Uruguay.svg.png","colors":[{"hex":"#FFFFFF","percent":55.07},{"hex":"#9E830E","percent":2.27},{"hex":"#C6D3EC","percent":2.14},{"hex":"#8DA6D8","percent":1.77},{"hex":"#F8CE16","percent":1.76},{"hex":"#547AC5","percent":1.63}],"code":"UY"},
                {"name":"Uzbekistan","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/200px-Flag_of_Uzbekistan.svg.png","colors":[{"hex":"#FFFFFF","percent":32.73},{"hex":"#1EB53A","percent":32},{"hex":"#0099B5","percent":30.73},{"hex":"#CE1126","percent":4},{"hex":"#4EB8CC","percent":0.34},{"hex":"#89D0DD","percent":0.21}],"code":"UZ"},
                {"name":"Vanuatu","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Vanuatu.svg/167px-Flag_of_Vanuatu.svg.png","colors":[{"hex":"#009543","percent":31.22},{"hex":"#D21034","percent":31.14},{"hex":"#010100","percent":25.81},{"hex":"#FCCE12","percent":8.53},{"hex":"#A6870B","percent":2.02},{"hex":"#7A6308","percent":1.05}],"code":"VU"},
                {"name":"Vatican City","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_the_Vatican_City.svg/100px-Flag_of_the_Vatican_City.svg.png","colors":[{"hex":"#FFE000","percent":50},{"hex":"#FFFFFF","percent":41.48},{"hex":"#D1D0CE","percent":4.14},{"hex":"#AA9A68","percent":2.08},{"hex":"#B2890F","percent":1.97},{"hex":"#9C2C20","percent":0.22}]},
                {"name":"Venezuela","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Venezuela.svg/150px-Flag_of_Venezuela.svg.png","colors":[{"hex":"#FFCC00","percent":33},{"hex":"#CF142B","percent":33},{"hex":"#00247D","percent":30.35},{"hex":"#555C53","percent":1},{"hex":"#441F62","percent":1},{"hex":"#2E4B94","percent":0.15}],"code":"VE"},
                {"name":"Vietnam",                                  code: "VN", "colors":[{"hex":"#C8102E","percent":93},{"hex":"#FFCD00","percent":7}]},
                {"name":"Western Sahara",                           code: "EH", "colors":[{"hex":"#C4111B","percent":18},{"hex":"#000000","percent":30},{"hex":"#FFFFFF","percent":22},{"hex":"#007A3D","percent":30}]},
                {"name":"Yemen","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Yemen.svg/150px-Flag_of_Yemen.svg.png","colors":[{"hex":"#000000","percent":33},{"hex":"#CE1126","percent":33},{"hex":"#FFFFFF","percent":32},{"hex":"#ABABAB","percent":1},{"hex":"#EFB0B7","percent":1}],"code":"YE"},
                {"name":"Zambia","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Zambia.svg/150px-Flag_of_Zambia.svg.png","colors":[{"hex":"#198A00","percent":74.11},{"hex":"#EF7D00","percent":7.71},{"hex":"#DE2010","percent":7.25},{"hex":"#000000","percent":7.23},{"hex":"#904F05","percent":1.1},{"hex":"#4C6C02","percent":0.71}],"code":"ZM"},
                {"name":"Zimbabwe","url":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Flag_of_Zimbabwe.svg/200px-Flag_of_Zimbabwe.svg.png","colors":[{"hex":"#319208","percent":26.21},{"hex":"#DE2010","percent":22.07},{"hex":"#FFFFFF","percent":11.23},{"hex":"#000000","percent":10.64},{"hex":"#C5C002","percent":2.31},{"hex":"#F18507","percent":1.48}],"code":"ZW"},
                
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
                // {"name":"Lao People'S Democratic Republic","code":"LA"},
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
            console.log("updateCanvas")

            canvas.width = el.clientWidth
            canvas.height = el.clientHeight
            Paper.setup(canvas)
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
