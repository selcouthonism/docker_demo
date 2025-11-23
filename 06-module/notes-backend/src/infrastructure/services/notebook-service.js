import { ServiceUnavailableError } from '../../domain/errors.js';
import axios from 'axios';

export class HttpNotebookService {
  // In a real app, you would inject 'axios' or 'fetch' here
  async checkExists(notebookId) {
    console.log(`Checking existence of Notebook ID: ${notebookId}...`);

    try{
      const API_URL = process.env.NOTEBOOKS_API_URL;
      console.log(`Calling service: ${API_URL}/${notebookId}`)
      await axios.get(`${API_URL}/${notebookId}`)

    }catch(err){
      console.error(`Notebook not found ${notebookId}`);
      return false;
    }

    // SIMULATION LOGIC
    // Simulate 10% chance service is DOWN
    const isServiceDown = Math.random() < 0.1; 
    if (isServiceDown) {
      console.error("External Notebooks Service is Unreachable!");
      throw new ServiceUnavailableError("Notebook service unreachable");
    }

    // Simulate specific ID '999' as Not Found
    if (notebookId === '999') {
      return false;
    }

    return true;
  }
}