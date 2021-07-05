
for (let i = 201; i <= 227; i++) {
    cardComponent(i,`b_${i}`,`v_${i}`,`i_${i}`,`cos_${i}`,`fm1_${i}`,`freq_${i}`,`fm2_${i}`,`pwr_${i}`,`ac_${i}`,`key_${i}`,`kulkas_${i}`,`emer_${i}`);
  }


function cardComponent(kamar,btn,volt,curr,phi,flow1,freq,flow2,pwr,ac,key,kulkas,emer){
    document.write(`
      <div class="card text-white bg-dark border-white col-12 col-sm-6 col-md-3 mx-auto mt-3" style="max-width: 18rem;">
        <div class="card-body text-white bg-dark ">
          <h5 class="card-title text-center">
            <span>Kamar</span>
            <span>${kamar}</span>
          </h5>
        </div>
        <li class="list-group-item text-white" style="background-color: #708090;">
          <div class="row align-items-start">
            <div class="col">
              <span>V :</span>
              <span id="${volt}"> 0 </span>
            </div>
            <div class="col">
              <span>I :</span>
              <span id="${curr}">0 </span>
            </div>
          </div>
        </li>
        <li class="list-group-item text-white" style="background-color: #708090;">
          <span>Cos-Phi : </span>
          <span id="${phi}">  20</span>
        </li>
        <li class="list-group-item text-white" style="background-color: #708090;">
          <div class="row align-items-start">
            <div class="col">
              <span>FM1 :</span>
              <span id="${flow1}">20 </span>
            </div>
            <div class="col">
              <span>F :</span>
              <span id="${freq}"> 20 </span>
              <span> Hz </span>
            </div>
          </div>
        </li>
        <li class="list-group-item text-white" style="background-color: #708090;">
          <div class="row align-items-start">
            <div class="col">
              <span>FM2 :</span>
              <span id="${flow2}"> 20 </span>
            </div>
            <div class="col">
              <span>Kwh :</span>
              <span id="${pwr}">20 </span>
            </div>
          </div>
        </li>
        <li class="list-group-item text-white" style="background-color: #708090;">
        <div class="row align-items-start">
          <div class="col">
              <div id="${ac}" class="dotBlack"></div>
          </div>
          <div class="col">
              <div> Init </div>
          </div>
            <div class="col">
              <div id="${key}" class="dotBlack"></div>
            </div>
            <div class="col">
              <div> Key </div>
            </div>
        </div>
      </li>
      <li class="list-group-item text-white" style="background-color: #708090;">
        <div class="row align-items-start">
          <div class="col">
              <div id="${kulkas}" class="dotBlack"></div>
          </div>
          <div class="col">
              <div>C.IN</div>
          </div>
            <div class="col">
              <div id="${emer}" class="dotBlack"></div>
            </div>
            <div class="col">
              <div>Fire.A</div>
            </div>
        </div>
      </li>
        <div class="card-body text-white bg-dark mb-1 text-center">
          <button type="button" id="${btn}" class="btn btn-outline-light" onClick="reply_click(this.id)" >Check-In</span></button>
        </div>
      </div>
    
    `);
    return;
    }