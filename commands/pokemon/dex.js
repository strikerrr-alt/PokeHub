// Import modules
const { Command } = require('discord-akairo');
const { get } = require('snekfetch');

// Create main command class
class DexCommand extends Command {
    constructor() {
        super('dex', {
                category: 'pokemon',
                aliases: ['pokedex', 'd', 'dex'],
                typing: true,
                args: [
                    {
                        id: 'pokemon',
                        type: 'string',
                        match: 'content'
                    }
                ]
            });
    }

    // Command execution func
    async exec(msg, args) {
        // Create variable for measuring fetch time
        const startTime = Date.now();

        // Pokemon name stuff
        const pokemonName = args.pokemon,
            pokemonNameLower = pokemonName.toLowerCase();

        const pokemonNameEmbed = pokemonNameLower.charAt(0).toUpperCase() + pokemonNameLower.slice(1);

        // Fetch Pokemon object
        let response = '';
        response = await get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonObject = response.body;

        // Other fetch time related variable
        const endTime = Date.now();

        // Fetch time
        const fetchTime = Math.round(endTime - startTime);

        // Creating embed to send to Discord
        const pokemonDexEmbed = this.client.util.embed()
            .setAuthor('PokéHub', this.client.user.avatarURL({ size: 1024 }), 'https://discordapp.com/oauth2/authorize?client_id=611554251918934016&permissions=313408&scope=bot')
            .setColor('#ee1515')
            .setFooter(`Data fetched in ${fetchTime}ms.`)
            .setImage(pokemonObject.sprites.front_default)
            .setTitle(pokemonNameEmbed);

        // Adding Pokemon Type
        if (pokemonObject.types.length == 1) pokemonDexEmbed.addField('Types', pokemonObject.types[0].type.name, true);
        else if (pokemonObject.types.length == 2) pokemonDexEmbed.addField('Types', `${pokemonObject.types[0].type.name} | ${pokemonObject.types[1].type.name}`, true);


        // Adding Pokemon abilities
        let [abilityOne, abilityTwo, abilityThree] = ['', '', ''];

        if (pokemonObject.abilities.length == 1) {
             abilityOne = pokemonObject.abilities[0].ability;
        }

        else if (pokemonObject.abilities.length == 2) {
             abilityOne = pokemonObject.abilities[0].ability;
             abilityTwo = pokemonObject.abilities[1].ability;
        }

        else if (pokemonObject.abilities.length == 3) {
             abilityOne = pokemonObject.abilities[0].ability;
             abilityTwo = pokemonObject.abilities[1].ability;
             abilityThree = pokemonObject.abilities[2].ability;
        }

        if (abilityOne.is_hidden == true) abilityOne.name == `*${abilityOne.name}*`;
        else if (abilityTwo.is_hidden == true) abilityTwo.name == `*${abilityTwo.name}*`;
        else if (abilityThree.is_hidden == true) abilityThree.name == `*${abilityThree.name}*`;

        if (abilityOne.name && !abilityTwo.name &&!abilityThree.name) pokemonDexEmbed.addField('Abilities', abilityOne.name, true);
        else if (abilityOne.name && abilityTwo.name && !abilityThree.name) pokemonDexEmbed.addField('Abilities', `${abilityOne.name}, ${abilityTwo.name}`, true);
        else if (abilityOne.name && abilityTwo.name && abilityThree.name) pokemonDexEmbed.addField('Abilities', `${abilityOne.name}, ${abilityTwo.name}, ${abilityThree.name}`, true);

        // Adding evolutionary line
        response = await get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
        const pokemonSpeciesObject = response.body;

        response = await get(pokemonSpeciesObject.evolution_chain.url);
        const pokemonEvochainObject = response.body;

        let [firstEvo, secondEvo, thirdEvo] = ['', '', ''];

        if (pokemonEvochainObject.chain.species.name) firstEvo = pokemonEvochainObject.chain.species.name;
        if (pokemonEvochainObject.chain.evolves_to[0].species.name) secondEvo = pokemonEvochainObject.chain.evolves_to[0].species.name;
        if (pokemonEvochainObject.chain.evolves_to[0].evolves_to[0].species.name) thirdEvo = pokemonEvochainObject.chain.evolves_to[0].evolves_to[0].species.name;

        const evolutionString = `**${firstEvo}** >> **${secondEvo}** >> **${thirdEvo}**`;

        pokemonDexEmbed.addField('Evolution Chain', evolutionString, true);

        // Send Embed
        msg.channel.send(pokemonDexEmbed);
    }
}

module.exports = DexCommand;