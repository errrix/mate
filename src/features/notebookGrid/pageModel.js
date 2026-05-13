export const PRINT_PAGE = {
    pageWidthMm: 210,
    pageHeightMm: 297,
    marginMm: 0,
    headerHeightMm: 24,
    footerHeightMm: 14,
    cellSizeMm: 7
};

export function createPageModel(config = PRINT_PAGE) {
    const contentWidthMm = config.pageWidthMm - config.marginMm * 2;
    const contentHeightMm = config.pageHeightMm
        - config.marginMm * 2
        - config.headerHeightMm
        - config.footerHeightMm;

    return {
        ...config,
        contentWidthMm,
        contentHeightMm,
        cols: Math.floor(contentWidthMm / config.cellSizeMm),
        rows: Math.floor(contentHeightMm / config.cellSizeMm)
    };
}

export const DEFAULT_PAGE_MODEL = createPageModel();
