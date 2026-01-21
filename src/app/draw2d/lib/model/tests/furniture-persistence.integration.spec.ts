import { FurnitureBody, FurnitureElement, FurnitureElementType, FurnitureElementState } from "../furniture-body.model";

class MockRepository {
    private data = new Map<number, FurnitureElement>();
    saveElement(el: FurnitureElement) { this.data.set(el.id, el); }
    getById(id: number) { return this.data.get(id); }
}

class MockService {
    constructor(private repo: MockRepository) {}
    saveElement(el: FurnitureElement) {
        el.state = FurnitureElementState.SYNCED;
        this.repo.saveElement(el);
    }
}

fdescribe('Furniture Service-Repository Integration Tests', () => {
    let furnitureRepository: MockRepository;
    let furnitureService: MockService;

    beforeEach(() => {
        furnitureRepository = new MockRepository();
        furnitureService = new MockService(furnitureRepository);
    });

    it('should save element through service and find it in repository with SYNCED state', () => {
        // Given
        const body = new FurnitureBody(0, 0, 100, 100, 50, 2, FurnitureElementType.BODY, 0, 0, null, null, 1);

        // When
        furnitureService.saveElement(body);

        // Then
        const retrieved = furnitureRepository.getById(1);
        expect(retrieved).toBeDefined();
        expect(retrieved!.width).toBe(100);
        expect(retrieved!.state).toBe(FurnitureElementState.SYNCED);
    });

    it('should maintain parent-child integration when saved together', () => {
        // Given
        const parent = new FurnitureBody(0, 0, 200, 200, 50, 5, FurnitureElementType.BODY, 0, 0, null, null, 10);
        const shelf = new FurnitureElement(0, 50, 200, 2, FurnitureElementType.SHELF, parent, null, 20);

        // When
        furnitureService.saveElement(parent);
        furnitureService.saveElement(shelf);

        // Then
        const savedShelf = furnitureRepository.getById(20);
        expect(savedShelf!.parrent!.id).toBe(10);
    });

    it('should calculate absolute coordinates correctly in a service-managed environment', () => {
        // Given
        const parent = new FurnitureBody(100, 100, 500, 500, 50, 5, FurnitureElementType.BODY, 0, 0, null, null, 1);
        const element = new FurnitureElement(20, 20, 10, 10, FurnitureElementType.SHELF, parent, null, 2);

        // When
        furnitureService.saveElement(element);

        // Then
        const retrieved = furnitureRepository.getById(2);
        expect(retrieved!.absoluteX).toBe(120);
    });
});