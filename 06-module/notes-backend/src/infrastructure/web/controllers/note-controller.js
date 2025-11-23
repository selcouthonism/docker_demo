import { CreateNoteRequestDTO } from '../../web/dtos/create-note-request.dto.js';
import { NoteResponseDTO } from '../../web/dtos/note-response.dto.js';

export class NoteController {
  constructor(createNoteUseCase) {
    this.createNoteUseCase = createNoteUseCase;
  }

  // Using arrow function to preserve 'this' context
  create = async (req, res) => {

    //if(!req.body) throw new ValidationError(); res.status(400).json({ error: 'Validation Failed', message: "Body cannot be empty." });

    // 1. Ingest and Validate Input (Request DTO)
    const requestDto = new CreateNoteRequestDTO(req.body);
    requestDto.validate();


    // 2. Execute Logic (Pass clean data to Use Case)
    const noteEntity = await this.createNoteUseCase.execute(
      requestDto.toUseCaseInput()
    );

    // 3. Format Output (Response DTO)
    const responseDto = NoteResponseDTO.from(noteEntity);
    res.status(201).json(responseDto);

    /*
    // Before dto
    const { title, content, notebookId } = req.body;
    const note = await this.createNoteUseCase.execute({
      title,
      content,
      notebookId
    });
    res.status(201).json(note);
    */
  }

  find = async (req, res) => {
    const id = req.params.id;

    const noteEntity = await this.createNoteUseCase.find(id);

    // Format Output (Response DTO)
    const responseDto = NoteResponseDTO.from(noteEntity);
    res.json(responseDto);

  }

  list = async (req, res) => {
    const notes = await this.createNoteUseCase.list();

    const responseDtos = notes.map(note => NoteResponseDTO.from(note));

    res.json(responseDtos);
  };
}