import DynamicProperties from "../dynamic-properties-bedrock/index";
export default class CustomEnchanted {
    db = new DynamicProperties("enchanteds");
    constructor(enchanted) {
        this.db.clear();
        enchanted.forEach(({ name, maxLevel, incompatible }) => {
            const fix = name.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
            this.db.set(this.db.hex(5), {
                name: fix,
                maxLevel,
                incompatible
            });
        });
    }
    on(name, player, callback, cooldown) {
        const container = player.getComponent("inventory").container;
        const item = container.getItem(player.selectedSlot);
        const fix = name.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        if (!this.db.array.some(v => v[1].name === fix))
            return CustomEnchanted.remove(fix, item);
        const enchanteds = CustomEnchanted.get(item);
        if (enchanteds.some(v => v.name === fix)) {
            const level = enchanteds.find(v => v.name === fix).level;
            if (cooldown) {
                if (!item.getDynamicProperty("cooldown"))
                    item.setDynamicProperty("cooldown", new Date().toString());
                const want = new Date(item.getDynamicProperty("cooldown"));
                const diff = Math.abs(new Date().getTime() - want.getTime());
                const timer = (cooldown.duration + level) - Math.ceil(diff / 1000);
                if (Math.ceil(diff / 1000) < cooldown.duration + level)
                    cooldown.notify(timer);
                else {
                    item.setDynamicProperty("cooldown", new Date().toString());
                    callback(level, item);
                    container.setItem(player.selectedSlot, item);
                }
            }
            else
                callback(level, item);
        }
    }
    static db = new DynamicProperties("enchanteds");
    static max(name) {
        const fix = name.charAt(0).toUpperCase() + name.slice(1);
        const enchanteds = this.db.array.find(v => v[1].name === fix);
        if (!enchanteds)
            return 0;
        return enchanteds[1].maxLevel;
    }
    static incompatible(name, item) {
        const fix = name.charAt(0).toUpperCase() + name.slice(1);
        const enchantedsItem = this.get(item);
        const enchanteds = this.db.array.find(v => v[1].name === fix);
        if (!enchanteds[1].incompatible)
            return false;
        return enchanteds[1].incompatible.some(v => enchantedsItem.some(v => v.name === v.name));
    }
    static set(enchanted, item) {
        const fix = enchanted.name.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        if (enchanted.level <= 0)
            console.error("Level must be greater than 0");
        else if (this.incompatible(enchanted.name, item))
            console.error(`${enchanted.name} is incompatible with ${item.typeId}`);
        else if (this.max(fix) < enchanted.level)
            console.error(`${enchanted.name} has reached its maximum level (${this.max(fix)})`);
        else if (this.get(item).some(v => v.name === fix)) {
            const enchanteds = this.get(item);
            const index = enchanteds.findIndex(v => v.name === fix);
            enchanteds[index].level = enchanted.level;
            const nameTag = item.nameTag.split("\n")[0];
            item.nameTag = [
                `§r§b${nameTag ?? ToolsEnchanted.name(item.typeId)}`,
                ...enchanteds.map(v => `§r§7${v.name} ${ToolsEnchanted.roman(v.level)}`)
            ].join("\n");
            return item;
        }
        else {
            item.nameTag = [
                `§r§b${item.nameTag ?? ToolsEnchanted.name(item.typeId)}`,
                `§r§7${fix} ${ToolsEnchanted.roman(enchanted.level)}`
            ].join("\n");
            return item;
        }
    }
    static get(item) {
        if (!item.nameTag)
            return [];
        const array = item.nameTag.split("\n");
        const cut = array.slice(1, array.length);
        const enchanteds = cut.map(enchanted => {
            const divide = enchanted.split(" ");
            const name = divide.splice(0, divide.length - 1).join(" ");
            const level = divide[divide.length - 1];
            return { name: name.slice(4, name.length), level: ToolsEnchanted.arabic(level) };
        });
        return enchanteds;
    }
    static remove(name, item) {
        const fix = name.charAt(0).toUpperCase() + name.slice(1);
        const array = item.nameTag.split("\n");
        const cut = array.slice(1, array.length);
        const enchanteds = cut.filter(s => !s.includes(fix));
        item.nameTag = [array[0], ...enchanteds].join("\n");
        return item;
    }
}
class ToolsEnchanted {
    static roman(num) {
        const key = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "M", "MM", "MMM"];
        let roman = "";
        let i = 0;
        while (num > 0) {
            roman = key[(num % 10) + i * 10] + roman;
            num = Math.floor(num / 10);
            i++;
        }
        return roman;
    }
    static arabic(roman) {
        const map = {
            "I": 1,
            "V": 5,
            "X": 10,
            "L": 50,
            "C": 100,
            "D": 500,
            "M": 1000
        };
        let result = 0;
        let prevValue = 0;
        for (let i = roman.length - 1; i >= 0; i--) {
            const value = map[roman[i]];
            if (value < prevValue) {
                result -= value;
            }
            else {
                result += value;
            }
            prevValue = value;
        }
        return result;
    }
    static name(typeId) {
        const base = typeId.split(":")[1].split("_");
        return base.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    }
}
