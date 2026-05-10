export const PRINT_PAGE = {
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginMm: 10,
    cellSizeMm: 5
};

export function createPageModel(config = PRINT_PAGE) {
    const contentWidthMm = config.pageWidthMm - config.marginMm * 2;
    const contentHeightMm = config.pageHeightMm - config.marginMm * 2;

    return {
        ...config,
        contentWidthMm,
        contentHeightMm,
        cols: Math.floor(contentWidthMm / config.cellSizeMm),
        rows: Math.floor(contentHeightMm / config.cellSizeMm)
    };
}

export const DEFAULT_PAGE_MODEL = createPageModel();
