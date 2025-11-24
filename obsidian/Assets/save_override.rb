# Set your mod's internal name here.
# Used primarily to set the save directory for your mod.
MOD_NAME = "CHANGE_ME"

# Make changes past this point at your own risk
# --------------------------------------------------

# Ensure the modder actually changed the name
if MOD_NAME == "CHANGE_ME"
    print("You did not set the mod's name.")
    print("See the 'Patch_Init' script for details.")
    exit()
end

# Store vanilla save path in case someone might want to use it
Oneshot::VANILLA_SAVE_PATH = Oneshot::SAVE_PATH

# Override the `SAVE_PATH` constant, and ensure the directory exists
Oneshot::SAVE_PATH = "#{Oneshot::SAVE_PATH}/mod_#{MOD_NAME}"
Dir.mkdir(Oneshot::SAVE_PATH) unless File.exist?(Oneshot::SAVE_PATH)