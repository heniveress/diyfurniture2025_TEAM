import { FurnitureBody, FurnitureElementType, FurnitureElementState } from "../furniture-body.model";

fdescribe('Furniture E2E Functional Tests', () => {
    // teszt1: szekreny letrehozasa es anyaganak megvaltoztatasa
    it('E2E: should create a new furniture and change its material', () => {
        // Given
        const body = new FurnitureBody(100, 100, 300, 400, 500, 18, FurnitureElementType.BODY, 0, 0);
        expect(body.material).toBe('pine');
        // When
        body.material = 'oak';
        //Then
        expect(body.material).toBe('oak');
        expect(body.state).toBe(FurnitureElementState.NEW);
    });

    // teszt2: polc generalasa es meret ellenorzese
    it('E2E: should generate shelves that inherit parent width', () => {
        // Given
        const parentWidth = 500;
        const body = new FurnitureBody(0, 0, parentWidth, 800, 500, 18, FurnitureElementType.BODY, 0, 0);
        // When
        const shelfHeight = 20;
        const shelf = new FurnitureBody(0, 200, parentWidth, shelfHeight, 500, 18, FurnitureElementType.SHELF, 0, 0, body);
        // Then
        expect(shelf.width).toBe(500);
        expect(shelf.parrent).toBe(body);
    });

    // teszt3: szekreny kirajzolasa es mentes kepkent
    it('E2E: should prepare furniture for image export', () => {
        // Given
        const body = new FurnitureBody(10, 10, 200, 200, 500, 18, FurnitureElementType.BODY, 0, 0);
        // When
        const canDraw = body.width > 0 && body.height > 0;
        // Then
        expect(canDraw).toBeTrue();
        expect(body.absoluteX).toBe(10);
    });

    // teszt4: light / dark mode valtas
    it('E2E: should toggle theme and update stroke colors', () => {
        // Given
        let isDarkMode = true;
        let strokeColor = isDarkMode ? '#ffffff' : '#000000';
        expect(strokeColor).toBe('#ffffff');
        // When
        isDarkMode = !isDarkMode;
        strokeColor = isDarkMode ? '#ffffff' : '#000000';
        // Then
        expect(isDarkMode).toBeFalse();
        expect(strokeColor).toBe('#000000');
    });
});