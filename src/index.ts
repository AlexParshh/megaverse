import { MegaVerse } from './MegaVerse';
import { GoalMap, SoloonColor, ComethDirection } from './types';

async function main() {
  const megaverse = new MegaVerse({
    baseUrl: 'https://challenge.crossmint.io/api',
    candidateId: '2a00e553-0e35-4e6a-90ae-c17938a0686b',
  });

  try {
    await challenge(megaverse);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function resetMap(megaverse: MegaVerse) {
  try {
    const goalMap = await megaverse.getGoalMap() as GoalMap;
    let deletedCount = 0;

    for (let row = 0; row < goalMap.goal.length; row++) {
      for (let col = 0; col < goalMap.goal[row].length; col++) {
        const cell = goalMap.goal[row][col];
        const position = { row, column: col };

        try {
          await Promise.all([
            cell === 'POLYANET' && megaverse.deletePolyanet(position),
            cell.endsWith('_SOLOON') && megaverse.deleteSoloon(position),
            cell.endsWith('_COMETH') && megaverse.deleteCometh(position),
          ]);
          deletedCount += 1;
          if (deletedCount % 10 === 0) {
            console.log(`Processed ${deletedCount} positions...`);
          }
        } catch (error) {
          console.error(`Error clearing position [${row}, ${col}]:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    console.log(`Map reset complete! Processed ${deletedCount} positions.`);
  } catch (error) {
    console.error('Error resetting map:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function challenge(megaverse: MegaVerse) {
  try {
    const goalMap = await megaverse.getGoalMap() as GoalMap;
    let stats = {
      polyanets: { total: 0, success: 0 },
      soloons: { total: 0, success: 0 },
      comeths: { total: 0, success: 0 }
    };
    
    for (let row = 0; row < goalMap.goal.length; row++) {
      for (let col = 0; col < goalMap.goal[row].length; col++) {
        const cell = goalMap.goal[row][col];
        const position = { row, column: col };

        try {
          if (cell === 'POLYANET') {
            stats.polyanets.total += 1;
            await megaverse.createPolyanet(position);
            console.log(`Created polyanet at row ${row}, column ${col}`);
            stats.polyanets.success += 1;
          } 
          else if (cell.endsWith('_SOLOON')) {
            stats.soloons.total += 1;
            const color = cell.split('_')[0].toLowerCase() as SoloonColor;
            await megaverse.createSoloon(position, color);
            console.log(`Created ${color} soloon at row ${row}, column ${col}`);
            stats.soloons.success += 1;
          }
          else if (cell.endsWith('_COMETH')) {
            stats.comeths.total += 1;
            const direction = cell.split('_')[0].toLowerCase() as ComethDirection;
            await megaverse.createCometh(position, direction);
            console.log(`Created ${direction} cometh at row ${row}, column ${col}`);
            stats.comeths.success += 1;
          }
        } catch (error) {
          console.error(`Failed at row ${row}, column ${col}:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    console.log(`Polyanets: ${stats.polyanets.success}/${stats.polyanets.total} created`);
    console.log(`Soloons: ${stats.soloons.success}/${stats.soloons.total} created`);
    console.log(`Comeths: ${stats.comeths.success}/${stats.comeths.total} created`);

    const totalSuccess = stats.polyanets.success + stats.soloons.success + stats.comeths.success;
    const totalObjects = stats.polyanets.total + stats.soloons.total + stats.comeths.total;

    if (totalSuccess === totalObjects) {
      console.log(`Success! All ${totalObjects} objects were created successfully.`);
    } else {
      console.log(`Created ${totalSuccess} out of ${totalObjects} objects.`);
      console.log(`Failed to create ${totalObjects - totalSuccess} objects.`);
    }

  } catch (error) {
    console.error('Error fetching goal map:', error instanceof Error ? error.message : 'Unknown error');
  }
}

main().catch(console.error);
