// Stage Selector Module
// Handles the service stage selection and column display logic

const StageSelector = {
    stageButtons: null,
    serviceColumns: null,
    columns: null,

    init() {
        this.stageButtons = document.querySelectorAll('.stage-selector-btn');
        this.serviceColumns = document.getElementById('service-columns');
        this.columns = document.querySelectorAll('.service-column');

        this.attachEventListeners();
        this.handleStageSelection(1); // Initialize with stage 1 by default
    },

    showColumns(columnsToShow) {
        // Hide all columns first
        this.columns.forEach(column => {
            column.style.display = 'none';
        });

        // Show specified columns
        columnsToShow.forEach(columnNum => {
            const column = document.querySelector(`[data-column="${columnNum}"]`);
            if (column) {
                column.style.display = 'flex';
            }
        });

        // Update grid layout based on number of visible columns
        this.updateGridLayout(columnsToShow.length);
    },

    updateGridLayout(columnCount) {
        if (columnCount === 1) {
            this.serviceColumns.className = 'grid grid-cols-1 gap-8 lg:gap-12 max-w-md mx-auto';
        } else if (columnCount === 2) {
            this.serviceColumns.className = 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto';
        } else {
            this.serviceColumns.className = 'grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12';
        }
    },

    handleStageSelection(stage) {
        // Remove active class from all buttons
        this.stageButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        const activeButton = document.querySelector(`[data-stage="${stage}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Show appropriate columns based on selection
        switch(stage) {
            case 1:
                // Show columns 1, 2, and 3
                this.showColumns([1, 2, 3]);
                break;
            case 2:
                // Show columns 2 and 3
                this.showColumns([2, 3]);
                break;
            default:
                this.showColumns([1, 2, 3]);
        }
    },

    attachEventListeners() {
        this.stageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const stage = parseInt(button.getAttribute('data-stage'));
                this.handleStageSelection(stage);
            });
        });
    }
};

// Export for use in other modules
window.StageSelector = StageSelector;