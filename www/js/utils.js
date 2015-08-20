//utils
checkall = function(){
	 $(':checkbox').each(function() {
            this.value = "on";                        
        });
}
uncheckall = function(){
	 $(':checkbox').each(function() {
            this.value = "off";                          
        });
}