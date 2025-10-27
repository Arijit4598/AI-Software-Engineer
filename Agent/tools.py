import pathlib
import subprocess
from typing import Tuple
from langchain_core.tools import tool

PROJECT_ROOT = pathlib.Path.cwd() / "generated_project"


def safe_path_for_project(path: str) -> pathlib.Path:
    """Ensure a path stays within the project root."""
    p = (PROJECT_ROOT / path).resolve()
    if PROJECT_ROOT.resolve() not in p.parents and PROJECT_ROOT.resolve() != p.parent and PROJECT_ROOT.resolve() != p:
        raise ValueError("Attempt to write outside project root")
    return p


# ------------------------
# TOOL DEFINITIONS
# ------------------------

@tool
def write_file(path: str, content: str) -> str:
    """Write content to a file within the project root."""
    p = safe_path_for_project(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    return f"WROTE:{p}"


@tool
def read_file(path: str) -> str:
    """Read content from a file within the project root."""
    p = safe_path_for_project(path)
    if not p.exists():
        return ""
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


@tool
def list_files(directory: str = ".") -> str:
    """List all files recursively within a directory in the project root."""
    p = safe_path_for_project(directory)
    if not p.is_dir():
        return f"ERROR: {p} is not a directory"
    files = [str(f.relative_to(PROJECT_ROOT)) for f in p.glob("**/*") if f.is_file()]
    return "\n".join(files) if files else "No files found."


@tool
def get_current_directory() -> str:
    """Return the project root directory."""
    return str(PROJECT_ROOT)


@tool
def run_cmd(cmd: str, cwd: str = None, timeout: int = 30) -> Tuple[int, str, str]:
    """Run a shell command in a directory within the project root."""
    cwd_dir = safe_path_for_project(cwd) if cwd else PROJECT_ROOT
    try:
        res = subprocess.run(cmd, shell=True, cwd=str(cwd_dir), capture_output=True, text=True, timeout=timeout)
        return res.returncode, res.stdout, res.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Command timed out"

@tool
def print_tree(path: str = ".", depth: int = 2) -> str:
    """Prints a directory tree (alias for list_files)."""
    # This is just an alias for list_files, but depth is ignored for simplicity
    return list_files.run(path)

# ------------------------
# DUAL-NAME REGISTRATION
# ------------------------

# Create alternate tool objects (no NameError risk)
repo_browser_write_file = write_file.copy(update={"name": "repo_browser.write_file"})
repo_browser_read_file = read_file.copy(update={"name": "repo_browser.read_file"})
repo_browser_list_files = list_files.copy(update={"name": "repo_browser.list_files"})
repo_browser_get_current_directory = get_current_directory.copy(update={"name": "repo_browser.get_current_directory"})
repo_browser_print_tree = print_tree.copy(update={"name": "repo_browser.print_tree"})



def init_project_root():
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    return str(PROJECT_ROOT)