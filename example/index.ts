// Import necessary modules
import * as mc from "@minecraft/server"
import CustomEnchanted from ".."

// Create a new instance of CustomEnchanted with lightning enchantment
const enchanteds = new CustomEnchanted([{
    name: "lightning",
    maxLevel: 5
}])

// Subscribe to entityHitEntity event
mc.world.afterEvents.entityHitEntity.subscribe((event) => {
    // Extract damagingEntity and hitEntity from the event
    const { damagingEntity: player, hitEntity: target } = event;
    // Check if the damagingEntity is a player
    if (!(player instanceof mc.Player))
        return;
    // Call the lightning function
    lightning(player, target);
})

// Define the lightning function
function lightning(player: mc.Player, target: mc.Entity) {
    // Extract dimension and location from the target entity
    const { dimension, location } = target;
    // Get the player's inventory container
    const container = player.getComponent("inventory").container;
    // Get the item in the selected slot
    const item = container.getItem(player.selectedSlot);
    // If there's no item, return
    if (!item) return
    // Use the 'lightning' event from the CustomEnchanted instance
    enchanteds.on("lightning", item, (level) => {
        // Spawn lightning bolts based on the enchantment level
        for (let i = 0; i < level; i++) {
            dimension.spawnEntity("minecraft:lightning_bolt", location);
        }
    }, {
        // Specify additional options such as delay
        delay: 10,
        // The location of the item in the player's inventory
        slot: (item) => {
            container.setItem(player.selectedSlot, item);
        },
        // Notify the player when the cooldown is about to expire
        notify: (timer) => {
            player.sendMessage(`§cItem cooldown: ${timer}§r`)
        }
    });
}
