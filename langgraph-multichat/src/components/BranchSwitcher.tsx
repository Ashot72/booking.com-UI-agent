
export default function BranchSwitcher({
    branch,
    branchOptions,
    onSelect,
    isLoading
}: {
    branch: string | undefined,
    branchOptions: string[] | undefined
    onSelect: (branch: string) => void
    isLoading?: boolean
}) {
    if (!branchOptions || !branch) return null
    const index = branchOptions.indexOf(branch)

    return (
        <div
            className="d-flex align-items-center justify-content-start small"
            style={{ userSelect: "none" }}
        >
            <button
                onClick={() => {
                    const prevBranch = branchOptions[index - 1]
                    if (!prevBranch) return
                    onSelect(prevBranch)
                }}
                disabled={isLoading}
                className="btn btn-link"
                aria-label="Previous Page"
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            <span>
                {index + 1} / {branchOptions.length}
            </span>

            <button
                onClick={() => {
                    const nextBranch = branchOptions[index + 1]
                    if (!nextBranch) return
                    onSelect(nextBranch)
                }}
                disabled={isLoading}
                className="btn btn-link"
                aria-label="Next Page"
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
}