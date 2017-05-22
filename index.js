const RECIPE_ID = [71401, 71402, 71403, 71404, 71405, 71406, 71407, 71408, 71409, 71410, 71411, 71412],
      RECIPE_NAME = ['Floretta Soup',  'Moongourd Muffin', 'Popped Cobseed', 'Mudroot Salad', 'Grilled Pigling', 'Lamb Bulgogi', 'Struthio Breast Salad', 'Shevranberry Cookie', 'Half Moon Croquette','Traditional Bleakfields BBQ','Freeholds Flame Salad','Bleak Wings'],
      RECIPE_MATS = [
                    [71427, 71438, 71432], //Floretta / Butter / Milk
                    [71426, 71435, 71439], // Moongourd /  Flour Dough /  Salt
                    [71441, 71438], // Cobseed / Butter
                    [71428, 71436], //Mudroot / Salad Dressing
                    [80276, 71439], //Pigling Meat / Salt
                    [71433, 71425, 71440, 71437], //Lamb /  Taproot/ Flame Pepper/  Special Sauce
                    [71442, 71425, 71427, 71436], //Struthio Breast/ Taproot/ Floretta/ Salad Dressing
                    [71431, 71435, 71443], //Shevranberry/ Flour Dough/ Sugar
                    [71416, 71433, 71435], //Mudroot Salad/ Lamb/ Flour Dough
                    [71434, 71430, 71444, 71437], //Cured Pigling/  Sky Lotus/ Herb-Seasoned Salt/ Special Sauce
                    [71428, 71425, 71441, 71440, 71430, 71445], // 3x  Mudroot/ 3x Taproot/ 3x Cobseed/ 3x Flame Pepper/  Sky Lotus/  Special Salad Dressing
                    [71442, 71425, 71429, 71430, 71437, 71439] // 3x Struthio Breast/ 3x  Taproot/ Struthio Egg/  Sky Lotus/ Special Sauce/ Salt
                    ];

module.exports = function RootStockCrafter(dispatch) {
	let cid = null,
        crafting = null,
		enabled = false,
		timer = null,
		lastLocation = null,
        inventory = null,
        ID = null,
        index = null;
    
	dispatch.hook('S_LOGIN', 1, event => { ({cid} = event) })
	dispatch.hook('C_PLAYER_LOCATION', 1, event => { lastLocation = event })
    
    dispatch.hook('C_USE_ITEM', 1, event => {
        if(enabled && (RECIPE_ID.indexOf(event.item) != -1)){
            index = RECIPE_ID.indexOf(event.item);
            ID = event.item;
            message('Crafting ' + RECIPE_NAME[index] + ".");
            crafting = true;
            setTimeout(craft, 5000);
        }
    })
    
    dispatch.hook('S_INVEN', 3, event => {
		if(!enabled || !crafting) return;

        if(event.first) inventory = [];
		else if(!inventory) return;
        
        for(let item of event.items){
           if(RECIPE_MATS[index].includes(item.item) && checkAmount(item)) inventory.push(item.item); // Add only if the mat item is a required mat for recipe.
        }
        if(!event.more) {
            for(let item of RECIPE_MATS[index]){
                if(!inventory || !inventory.includes(item)) {     // Check if all the required mats for the recipie is in inventory.
                    message('Required materials are missing!');
                    stop();
                    break;
                }
            }
        }
    })
    
    
    function checkAmount(item){
        if(index > 9 && [71428, 71425, 71441, 71440, 71442].includes(item.item) && item.amount < 3) return false; 
        return true;  // Don't add if recipe needs 3x mats, but amount available mat is less than 3.
    }

     const chatHook = event => {
         if(event.message.toLowerCase().includes('!rootstock')) {
			if(enabled = !enabled) {
				message('Rootstock Crafter started.')
			}
			else
				stop()
			return false
		}
	}
    

	dispatch.hook('C_CHAT', 1, chatHook)

    
	dispatch.hook('C_RETURN_TO_LOBBY', 1, () => {
		if(enabled) return false // Prevents you from being automatically logged out while AFK
	})
    
	function craft() {
		dispatch.toServer('C_USE_ITEM', 1, {
			ownerId: cid,
			item: ID,
			id: 0,
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: 1,
			unk5: 0,
			unk6: 0,
			unk7: 0,
			x: lastLocation.x1,
			y: lastLocation.y1,
			z: lastLocation.z1,
			w: lastLocation.w,
			unk8: 0,
			unk9: 0,
			unk10: 0,
			unk11: 1
		});
        timer = setTimeout(craft, 5000);
	}

	function stop() {
		clearTimeout(timer);
        inventory = null;
        crafting = false;
        ID = null;
        index = null;
		enabled = false;
		message('RootStock Crafter stopped.');
	}

	function message(msg) {
		dispatch.toClient('S_CHAT', 1, {
			channel: 24,
			authorID: 0,
			unk1: 0,
			gm: 0,
			unk2: 0,
			authorName: '',
			message: '(Rootstock) ' + msg
		}),
        dispatch.toClient('S_CHAT', 1, {
            channel: 203,
            authorID: { high: 0, low: 0 },
            unk1: 0,
            gm: 0,
            unk2: 0,
            authorName: '',
            message: '(Rootstock) ' + msg
        });
	}
}