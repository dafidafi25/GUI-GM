function reply_click(clicked_id){
    if(clicked_id=="login"){
        if(document.getElementById(`username`).value=="admin" && document.getElementById(`password`).value=="admin123"){
            window.location.href = 'index.html';
        }
    }
}