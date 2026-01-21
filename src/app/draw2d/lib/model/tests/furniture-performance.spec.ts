import { FurnitureBody, FurnitureElement, FurnitureElementType, FurnitureElementState } from "../furniture-body.model";

fdescribe('Furniture Hardware Performance Tests', () => {

    it('should calculate absoluteX for a deep hierarchy (100 levels) under 10ms', () => {
        // Given: 100 elem mely hierarchia epitese
        let parent = new FurnitureBody(10, 10, 1000, 1000, 50, 5, FurnitureElementType.BODY, 0, 0);
        let lastChild = parent;
        
        for (let i = 0; i < 100; i++) {
            const child = new FurnitureElement(1, 1, 10, 10, FurnitureElementType.SHELF, lastChild);
            lastChild = child as any; 
        }

        // When: Merjuk a futasi idot a performance API-val
        const start = performance.now();
        const finalX = lastChild.absoluteX;
        const end = performance.now();
        const duration = end - start;

        // Then: Ellenorizzuk, hogy a hardver eleg gyors-e a rekurziohoz
        console.log(`[PERF] 100-level hierarchy calculation: ${duration}ms`);
        expect(finalX).toBe(110);
        expect(duration).toBeLessThan(10);
    });

    it('should handle state update of 1000 elements under 50ms', () => {
        // Given: 1000 darabos objektumhalmaz
        const elements: FurnitureElement[] = [];
        for (let i = 0; i < 1000; i++) {
            elements.push(new FurnitureElement(i, i, 10, 10, FurnitureElementType.DRAWER, null, null, i));
        }

        // When: Tomeges allapotfrissites merese
        const start = performance.now();
        elements.forEach(el => {
            el.state = FurnitureElementState.UPDATED;
        });
        const end = performance.now();
        const duration = end - start;

        // Then: A tomeges muvelet nem akaszthatja meg a rendszert
        console.log(`[PERF] Mass update of 1000 elements: ${duration}ms`);
        expect(duration).toBeLessThan(50);
    });
});